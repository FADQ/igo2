import { Injectable, OnDestroy } from '@angular/core';

import { Observable, BehaviorSubject, Subscription, zip } from 'rxjs';
import { skip } from 'rxjs/operators';

import { EntityRecord, EntityStore,  Workspace, WorkspaceStore } from '@igo2/common';

import {
  Client,
  ClientController,
  ClientSchemaElementTransactionService,
  ClientService,
  ClientParcel,
  ClientParcelYear,
  ClientParcelYearService,
  ClientSchemaElement,
  generateParcelColor
} from 'src/lib/client';

import { ClientControllerService } from './shared/client-controller.service';

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientState implements OnDestroy {

  activeController$: BehaviorSubject<ClientController> = new BehaviorSubject(undefined);

  get activeController(): ClientController { return this.activeController$.value; }

  /** Observable of the current controller */
  get controllerStore(): EntityStore<ClientController> { return this._controllerStore; }
  _controllerStore: EntityStore<ClientController>;

  /** Observable of a message or error */
  readonly message$ = new BehaviorSubject<string>(undefined);

  /** Current parcel year */
  private parcelYear: ClientParcelYear;

  /** Subscription to the parcel year changes */
  private parcelYear$$: Subscription;

  /** Subscription to the controllers changes */
  private controllers$$: Subscription;

  /** Store that holds all the "parcel years". This is not on a per client basis. */
  get parcelYearStore(): EntityStore<ClientParcelYear> { return this._parcelYearStore; }
  _parcelYearStore: EntityStore<ClientParcelYear>;

  get workspaceStore(): WorkspaceStore { return this._workspaceStore; }
  _workspaceStore: WorkspaceStore;

  constructor(
    private clientService: ClientService,
    private clientParcelYearService: ClientParcelYearService,
    private clientControllerService: ClientControllerService,
    private clientSchemaElementTransactionService: ClientSchemaElementTransactionService
  ) {
    this.initParcelYears();
    this.initControllers();
    this.initWorkspaces();
  }

  /**
   * Store that holds all the available workspaces
   */
  get store(): WorkspaceStore { return this._store; }
  private _store: WorkspaceStore;

  ngOnDestroy() {
    this.teardownWorkspaces();
    this.teardownControllers();
    this.teardownParcelYears();
  }

  getClientByNum(clientNum: string): Observable<Client> {
    const annee = this.parcelYear ? this.parcelYear.annee : undefined;
    return this.clientService.getClientByNum(clientNum, annee);
  }
  
  addClient(client: Client | undefined) {
    this.setClientNotFound(false);

    const currentController = this.controllerStore.get(client.info.numero);
    if (currentController !== undefined) {
      return;
    }

    const controller = this.clientControllerService.createClientController(client, {
      workspaceStore: this.workspaceStore
      // moveToParcels: this.shouldMoveToParcels()
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
    if (!controller.transaction.empty) {
      this.clientSchemaElementTransactionService.enqueue({
        schema: controller.schema,
        transaction: controller.transaction,
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
    const cliNum = controller.client.info.numero;
    const currentWorkspace = this.workspaceStore.activeWorkspace$.value;
    if (currentWorkspace !== undefined && currentWorkspace.meta.client.info.numero !== cliNum) {
      const workspaces = [controller.parcelWorkspace, controller.schemaWorkspace, controller.schemaElementWorkspace];
      const workspace = workspaces.find((_workspace: Workspace) => {
        return _workspace.meta.type === currentWorkspace.meta.type &&
          this.workspaceStore.get(_workspace.id) !== undefined;
      });
      this.workspaceStore.activateWorkspace(workspace || controller.parcelWorkspace);
    }
    this.workspaceStore.view.filter((workspace: Workspace) => {
      return workspace.meta.client.info.numero === cliNum;
    });
  }

  private initControllers() {
    this._controllerStore = new EntityStore<ClientController>([], {
      getKey: (controller: ClientController) => controller.client.info.numero
    });

    this.controllers$$ = this.controllerStore.entities$
      .subscribe((controllers: ClientController[]) => this.updateControllersColor());
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
  }

  private teardownWorkspaces() {
    this.workspaceStore.clear();
  }

  private initParcelYears() {
    this._parcelYearStore = new EntityStore<ClientParcelYear>([]);
    this._parcelYearStore.view.sort({
      valueAccessor: (year: ClientParcelYear) => year.annee,
      direction: 'desc'
    });

    this.loadParcelYears();

    this.parcelYear$$ = this.parcelYearStore.stateView
      .firstBy$((record: EntityRecord<ClientParcelYear>) => record.state.selected === true)
      .pipe(skip(1))
      .subscribe((record: EntityRecord<ClientParcelYear>) => {
        const parcelYear = record ? record.entity : undefined;
        this.onSelectParcelYear(parcelYear);
      });

  }

  private teardownParcelYears() {
    this.parcelYear$$.unsubscribe();
    this.parcelYearStore.clear();
  }

  private onSelectParcelYear(parcelYear: ClientParcelYear) {
    this.parcelYear = parcelYear;

    const clients$ = this.controllerStore.all().map((controller: ClientController) => {
      return this.getClientByNum(controller.client.info.numero);
    });

    zip(...clients$).subscribe((clients: Client[]) => {
      clients.forEach((client: Client) => {
        const controller = this.controllerStore.get(client.info.numero);
        controller.parcelStore.load(client.parcels, false);
      });
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
      if (controller.color !== undefined) {
        controller.setColor(undefined);
      }
      return;
    }

    this.controllerStore.all().forEach((controller: ClientController, index: number) => {
      if (controller.color === undefined) {
        const color = generateParcelColor(index);
        controller.setColor(color);
      }
    });
  }

  private shouldMoveToParcels(): boolean {
    for (const controller of this.controllerStore.all()) {
      const selectedParcel = controller.parcelStore.stateView
        .firstBy((record: EntityRecord<ClientParcel>) => record.state.selected === true);
      if (selectedParcel !== undefined) {
        return false;
      }

      const selectedElement = controller.schemaElementStore.stateView
        .firstBy((record: EntityRecord<ClientSchemaElement>) => record.state.selected === true);
      if (selectedElement !== undefined) {
        return false;
      }
    }

    return true;
  }
}
