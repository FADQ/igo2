import { Injectable, OnDestroy } from '@angular/core';

import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { EntityRecord, EntityStore,  Widget, Workspace, WorkspaceStore } from '@igo2/common';

import {
  Client,
  ClientController,
  ClientService,
  ClientParcelYear,
  ClientParcelYearService
} from 'src/lib/client';

import { ClientControllerService } from './shared/client-controller.service';

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientState implements OnDestroy {

  readonly activeController$: BehaviorSubject<ClientController> = new BehaviorSubject(undefined);

  readonly activeWidget$: BehaviorSubject<Widget> = new BehaviorSubject(undefined);

  get activeController(): ClientController { return this.activeController$.value; }

  /** Observable of the current controller */
  get controllerStore(): EntityStore<ClientController> { return this._controllerStore; }
  _controllerStore: EntityStore<ClientController>;

  /** Observable of a message or error */
  readonly message$ = new BehaviorSubject<string>(undefined);

  /** Current parcel year */
  private parcelYear: number;

  /** Subscription to the parcel year changes */
  private parcelYear$$: Subscription;

  /** Subscription to the controllers changes */
  private controllers$$: Subscription;

  private activeWorkspace$$: Subscription;

  private activeWorkspaceWidget$$: Subscription;

  /** Store that holds all the "parcel years". This is not on a per client basis. */
  get parcelYearStore(): EntityStore<ClientParcelYear> { return this._parcelYearStore; }
  _parcelYearStore: EntityStore<ClientParcelYear>;

  get workspaceStore(): WorkspaceStore { return this._workspaceStore; }
  _workspaceStore: WorkspaceStore;

  get activeWorkspace$(): BehaviorSubject<Workspace> { return this.workspaceStore.activeWorkspace$; }

  get activeWorkspace(): Workspace { return this.activeWorkspace$.value; }

  constructor(
    private clientService: ClientService,
    private clientParcelYearService: ClientParcelYearService,
    private clientControllerService: ClientControllerService
  ) {
    this.initParcelYears();
    this.initWorkspaces();
    this.initControllers();
  }

  /**
   * Store that holds all the available workspaces
   */
  get store(): WorkspaceStore { return this._store; }
  private _store: WorkspaceStore;

  ngOnDestroy() {
    this.teardownControllers();
    this.teardownWorkspaces();
    this.teardownParcelYears();
  }

  getClientByNum(clientNum: string): Observable<Client> {
    return this.clientService.getClientByNum(clientNum);
  }

  clearClientByNum(clientNum: string) {
    const controller = this.controllerStore.get(clientNum);
    if (controller !== undefined) {
      this.clearController(controller);
    }
  }

  addClient(client: Client | undefined) {
    this.setClientNotFound(false);

    const currentController = this.controllerStore.get(client.info.numero);
    if (currentController !== undefined) {
      return;
    }

    const controller = this.clientControllerService.createClientController(client, {
      workspaceStore: this.workspaceStore,
      controllerStore: this.controllerStore,
      parcelYear: this.parcelYear
    });
    this.controllerStore.insert(controller);
    if (this.activeController === undefined) {
      this.workspaceStore.activateWorkspace(controller.parcelWorkspace);
    }
  }

  setClientNotFound(notFound: boolean) {
    if (notFound === true) {
      this.message$.next('client.error.notfound');
    } else {
      this.message$.next(undefined);
    }
  }

  clearController(controller: ClientController) {
    if (!controller.schemaElementTransaction.empty) {
      controller.schemaElementTransactionService.enqueue({
        schema: controller.schema,
        transaction: controller.schemaElementTransaction,
        proceed: () => this.clearController(controller)
      });
      return;
    }

    if (!controller.parcelElementTransaction.empty) {
      controller.parcelElementTransactionService.enqueue({
        client: controller.client,
        annee: controller.parcelYear,
        transaction: controller.parcelElementTransaction,
        proceed: () => this.clearController(controller)
      });
      return;
    }

    if (controller === this.activeController) {
      this.setActiveController(undefined);
    }
    controller.destroy();
    this.controllerStore.delete(controller);
  }

  setActiveController(controller: ClientController) {
    if (controller === undefined) {
      if (this.activeController !== undefined) {
        this.controllerStore.state.update(this.activeController, {selected: false, active: false});
      }
      this.workspaceStore.view.filter(undefined);
      this.activeController$.next(undefined);
      return;
    }

    this.controllerStore.state.update(controller, {selected: true, active: true}, true);
    this.setControllerActiveWorkspace(controller);
    this.activeController$.next(controller);
  }

  private setControllerActiveWorkspace(controller: ClientController) {
    const clientNum = controller.client.info.numero;
    const currentWorkspace = this.activeWorkspace;
    if (currentWorkspace !== undefined && currentWorkspace.meta.client.info.numero !== clientNum) {
      const workspaces = [controller.parcelWorkspace, controller.schemaWorkspace, controller.schemaElementWorkspace];
      const workspace = workspaces.find((_workspace: Workspace) => {
        return _workspace.meta.type === currentWorkspace.meta.type &&
          this.workspaceStore.get(_workspace.id) !== undefined;
      });
      this.workspaceStore.activateWorkspace(workspace || controller.parcelWorkspace);
    }
    this.workspaceStore.view.filter((workspace: Workspace) => {
      return workspace.meta.client.info.numero === clientNum;
    });
  }

  private initControllers() {
    this._controllerStore = new EntityStore<ClientController>([], {
      getKey: (controller: ClientController) => controller.client.info.numero
    });

    this.controllers$$ = this.controllerStore.count$
      .subscribe((count: number) => {
        this.updateControllersColor();
        if (this.activeWorkspace !== undefined) {
          this.activeWorkspace.updateActionsAvailability();
        }
      });
  }

  private teardownControllers() {
    this.controllers$$.unsubscribe();
    this.controllerStore.all().forEach((controller: ClientController) => controller.destroy());
    this.controllerStore.clear();
  }

  private initWorkspaces() {
    this._workspaceStore = new WorkspaceStore([]);
    this._workspaceStore.view.sort({
      valueAccessor: (workspace: Workspace) => workspace.id,
      direction: 'asc'
    });

    this.activeWorkspace$$ = this._workspaceStore.activeWorkspace$.subscribe((workspace: Workspace) => {
      if (this.activeWorkspaceWidget$$ !== undefined) {
        this.activeWorkspaceWidget$$.unsubscribe();
        this.activeWorkspaceWidget$$ = undefined;
      }
      if (workspace !== undefined) {
        this.activeWorkspaceWidget$$ = workspace.widget$.subscribe((widget: Widget) => {
          this.activeWidget$.next(widget);
        });
      }
    });
  }

  private teardownWorkspaces() {
    this.workspaceStore.clear();
    if (this.activeWorkspaceWidget$$ !== undefined) {
      this.activeWorkspaceWidget$$.unsubscribe();
    }
    this.activeWorkspace$$.unsubscribe();
  }

  private initParcelYears() {
    this._parcelYearStore = new EntityStore<ClientParcelYear>([]);
    this._parcelYearStore.view.sort({
      valueAccessor: (year: ClientParcelYear) => year.annee,
      direction: 'desc'
    });

    this.parcelYear$$ = this.parcelYearStore.stateView
      .firstBy$((record: EntityRecord<ClientParcelYear>) => record.state.selected === true)
      .pipe(skip(1))
      .subscribe((record: EntityRecord<ClientParcelYear>) => {
        const parcelYear = record ? record.entity : undefined;
        this.onSelectParcelYear(parcelYear);
      });

    this.loadParcelYears();
  }

  private teardownParcelYears() {
    this.parcelYear$$.unsubscribe();
    this.parcelYearStore.clear();
  }

  private onSelectParcelYear(parcelYear: ClientParcelYear) {
    this.parcelYear = parcelYear === undefined ? undefined : parcelYear.annee;
    this.controllerStore.all().forEach((controller: ClientController) => {
      controller.setParcelYear(this.parcelYear);
    });
  }

  /**
   * Load the parcel years
   */
  private loadParcelYears() {
    this.clientParcelYearService.getParcelYears()
      .subscribe((parcelYears: ClientParcelYear[]) => {
        const current = parcelYears.find((parcelYear: ClientParcelYear) => {
          return parcelYear.current === true;
        });
        this.parcelYearStore.load(parcelYears);
        if (current !== undefined) {
          this.parcelYearStore.state.update(current, {selected: true});
        }
      });
  }

  private updateControllersColor() {
    if (this.controllerStore.count === 1) {
      const controller = this.controllerStore.all()[0];
      controller.applySingleClientStyle();
      return;
    }

    this.controllerStore.all().forEach((controller: ClientController, index: number) => {
      controller.applyMultiClientStyle();
    });
  }
}
