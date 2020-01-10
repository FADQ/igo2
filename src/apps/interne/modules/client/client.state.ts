import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { skip } from 'rxjs/operators';

import { LanguageService, Message, MessageType } from '@igo2/core';
import { EntityRecord, EntityStore,  Widget, Workspace, WorkspaceStore } from '@igo2/common';

import {
  Client,
  ClientController,
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

  /** Message */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /** Active widget observable. Only one may be active for all clients */
  readonly activeWidget$: BehaviorSubject<Widget> = new BehaviorSubject<Widget>(undefined);

  /** Whether at least one parcel element tx is ongoing */
  readonly parcelElementTxOngoing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get activeController(): ClientController { return this.activeController$.value; }
  readonly activeController$: BehaviorSubject<ClientController> = new BehaviorSubject(undefined);

  /** Observable of the current controller */
  get controllers(): EntityStore<ClientController> { return this._controllers; }
  _controllers: EntityStore<ClientController>;

  /** Current parcel year */
  readonly parcelYear$: BehaviorSubject<ClientParcelYear> = new BehaviorSubject(undefined);
  get parcelYear(): ClientParcelYear { return this.parcelYear$.value; }

  /** Subscription to the parcel year changes */
  private parcelYear$$: Subscription;

  /** Subscription to the controllers changes */
  private controllers$$: Subscription;

  /** Subscription to the active workspace */
  private activeWorkspace$$: Subscription;

  /** Subscription to the active workspace widget */
  private activeWorkspaceWidget$$: Subscription;

  /** Subscription to status of the parcel element txs */
  private parcelElementTxs$$: Subscription;

  /** Store that holds all the "parcel years". This is not on a per client basis. */
  get parcelYearStore(): EntityStore<ClientParcelYear> { return this._parcelYearStore; }
  _parcelYearStore: EntityStore<ClientParcelYear>;

  /** Store that holds all the workspaces. */
  get workspaces(): WorkspaceStore { return this._workspaces; }
  _workspaces: WorkspaceStore;

  /** Observable of the active workspace. */
  get activeWorkspace$(): BehaviorSubject<Workspace> { return this.workspaces.activeWorkspace$; }

  constructor(
    private clientParcelYearService: ClientParcelYearService,
    private clientControllerService: ClientControllerService,
    private languageService: LanguageService
  ) {
    this.initParcelYears();
    this.loadParcelYears();

    this.initWorkspaces();
    this.initControllers();
  }

  /**
   * Teardown all the controllers, workspaces and the parcel store
   * @internal
   */
  ngOnDestroy() {
    this.teardownControllers();
    this.teardownWorkspaces();
    this.teardownParcelYears();
  }

  /**
   * Create the client's controller, add it to the controller store and
   * activate it's parcel workspace if not controller is active
   * @param client Client
   */
  addClient(client: Client | undefined) {
    const currentController = this.controllers.get(client.info.numero);
    if (currentController !== undefined) {
      return;
    }

    const controller = this.clientControllerService.createClientController(client, {
      workspaces: this.workspaces,
      controllers: this.controllers,
      parcelYear: this.parcelYear
    });
    this.controllers.insert(controller);

    // Activate the newly added client's parcel workspace
    // if no controller is active (selected)
    if (this.activeController === undefined) {
      this.workspaces.activateWorkspace(controller.parcelWorkspace);
    }
  }

  /**
   * Destroy a client's controller and remove it from the controller store
   * @param clientNum Client num
   */
  clearClientByNum(clientNum: string) {
    const controller = this.controllers.get(clientNum);
    if (controller !== undefined) {
      this.destroyController(controller);
    }
  }

  /**
   * Destroy a client's controller and remove it from the controller store
   * @param clientNum Client num
   */
  setClientNotFound(notFound: boolean) {
    if (notFound === true) {
      const textKey = 'client.error.notfound';
      const text = this.languageService.translate.instant(textKey);
      this.message$.next({
        type: MessageType.ERROR,
        text
      });
    } else {
      this.message$.next(undefined);
    }
  }

  /**
   * Destroy a client's controller
   * Make sure ongoing transactions are resolved first
   * @param controller Controller
   */
  destroyController(controller: ClientController) {
    if (!controller.schemaElementTransaction.empty) {
      return controller.schemaElementTransactionService.prompt({
        schema: controller.schema,
        transaction: controller.schemaElementTransaction,
        proceed: () => this.destroyController(controller)
      });
    }

    if (!controller.parcelElementTransaction.empty) {
      return controller.parcelElementTransactionService.prompt({
        client: controller.client,
        annee: controller.parcelYear.annee,
        transaction: controller.parcelElementTransaction,
        proceed: () => this.destroyController(controller)
      });
    }

    if (controller === this.activeController) {
      this.setActiveController(undefined);
    }
    controller.destroy();
    this.controllers.delete(controller);
  }

  /**
   * Make a controller active. That means, showing only its workspaces
   * in the workspace selector.
   * @param controller Controller
   */
  setActiveController(controller: ClientController) {
    if (controller === undefined) {
      if (this.activeController !== undefined) {
        this.controllers.state.update(this.activeController, {selected: false, active: false});
      }
      this.workspaces.view.filter(undefined);
      this.activeController$.next(undefined);
      return;
    }

    this.controllers.state.update(controller, {selected: true, active: true}, true);
    this.setControllerActiveWorkspace(controller);
    this.activeController$.next(controller);
  }

  /**
   * Make a controller active
   * @param controller Controller
   */
  private setControllerActiveWorkspace(controller: ClientController) {
    const clientNum = controller.client.info.numero;
    const currentWorkspace = this.activeWorkspace$.value;
    if (currentWorkspace !== undefined && currentWorkspace.meta.client.info.numero !== clientNum) {
      // Activate one of those workspaces, based on the previously selected
      // workspace. For example, if client A schema workspace is selected
      // then client B is activated, make client B's schema workspace active
      const workspaces = [
        controller.parcelElementWorkspace,
        controller.parcelWorkspace,
        controller.schemaWorkspace,
        controller.schemaElementWorkspace
      ];
      const workspace = workspaces.find((_workspace: Workspace) => {
        return _workspace.meta.type === currentWorkspace.meta.type &&
          this.workspaces.get(_workspace.id) !== undefined;
      });
      this.workspaces.activateWorkspace(workspace || controller.parcelWorkspace);
    }

    this.workspaces.view.filter((workspace: Workspace) => {
      return workspace.meta.client.info.numero === clientNum;
    });
  }

  /**
   * Initialize the controller store and subscribe to it's count. When
   * more the store contains than one controller,
   * update each controller's color
   */
  private initControllers() {
    this._controllers = new EntityStore<ClientController>([], {
      getKey: (controller: ClientController) => controller.client.info.numero
    });

    this.controllers$$ = this.controllers.count$
      .subscribe((count: number) => {
        this.updateControllersColor();
        this.subscribeToParcelElementTxs();
      });
  }

  /**
   * Teardown controller store
   */
  private teardownControllers() {
    this.unsubscribeToParcelElementTxs();
    this.controllers$$.unsubscribe();
    this.controllers.all().forEach((controller: ClientController) => controller.destroy());
    this.controllers.clear();
  }

  /**
   * Update all controllers' color
   */
  private updateControllersColor() {
    if (this.controllers.count === 1) {
      const controller = this.controllers.all()[0];
      controller.applyParcelSingleClientStyle();
      return;
    }

    this.controllers.all().forEach((controller: ClientController, index: number) => {
      controller.applyParcelMultiClientStyle();
    });
  }

  /**
   * Initialize the workspace store. Each time a workspace is activated,
   * subscribe to it's active widget. Tracking the active widget is useful
   * to make sure only one widget is active at a time.
   */
  private initWorkspaces() {
    this._workspaces = new WorkspaceStore([]);
    this._workspaces.view.sort({
      valueAccessor: (workspace: Workspace) => workspace.id,
      direction: 'asc'
    });

    this.activeWorkspace$$ = this._workspaces.activeWorkspace$
      .subscribe((workspace: Workspace) => {
        if (this.activeWorkspaceWidget$$ !== undefined) {
          this.activeWorkspaceWidget$$.unsubscribe();
          this.activeWorkspaceWidget$$ = undefined;
        }

        if (workspace !== undefined) {
          this.activeWorkspaceWidget$$ = workspace.widget$
            .subscribe((widget: Widget) => this.activeWidget$.next(widget));
        }
      });
  }

  /**
   * Teardon the workspace store and any subscribers
   */
  private teardownWorkspaces() {
    this.workspaces.clear();
    if (this.activeWorkspaceWidget$$ !== undefined) {
      this.activeWorkspaceWidget$$.unsubscribe();
    }
    this.activeWorkspace$$.unsubscribe();
  }

  /**
   * Initialize the parcel year store and observe the selected parcel year
   */
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
  }

  /**
   * Teardown the parcel years store and the selected parcel year observer
   */
  private teardownParcelYears() {
    this.parcelYear$$.unsubscribe();
    this.parcelYearStore.clear();
  }

  /**
   * When a parcel year is selected, update the controllers parcel year
   * @param Parcel year
   */
  private onSelectParcelYear(parcelYear: ClientParcelYear) {
    this.parcelYear$.next(parcelYear);
    this.controllers.all().forEach((controller: ClientController) => {
      controller.setParcelYear(this.parcelYear);
    });
  }

  /**
   * Fetch parcel years via a service then load them into the store. Also,
   * select the current parcel year as selected
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

  /**
   * Subscribe to parcel element txs and check if one is active. This is useful
   * to enable or disable some stuff the the client tool, for example.
   */
  private subscribeToParcelElementTxs() {
    this.unsubscribeToParcelElementTxs();
    const parcelElementTxs$ = this.controllers.all()
      .map((controller: ClientController) => {
        return controller.parcelElementTxOngoing;
      });

    this.parcelElementTxs$$ = combineLatest(...parcelElementTxs$)
      .subscribe((bunch: boolean[]) => {
        const nosActive = bunch.every((active: boolean) => active === false);
        this.parcelElementTxOngoing$.next(!nosActive);
      });
  }

  /**
   * Unsubscribe to parcel element txs
   */
  private unsubscribeToParcelElementTxs() {
    if (this.parcelElementTxs$$ !== undefined) {
      this.parcelElementTxs$$.unsubscribe();
      this.parcelElementTxs$$ = undefined;
    }
  }

}
