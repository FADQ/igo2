import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { EntityRecord, EntityStore, EntityTransaction } from '@igo2/common';
import { FeatureStore } from '@igo2/geo';
import { EditionState, MapState } from '@igo2/integration';

import {
  Client,
  ClientService,
  ClientParcelDiagram,
  ClientParcel,
  ClientParcelYear,
  ClientSchema,
  ClientSchemaElement
} from 'src/lib/client';

import { ClientParcelState} from './client-parcel.state';
import { ClientSchemaState} from './client-schema.state';
import { ClientSchemaElementState } from './client-schema-element.state';

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientState implements OnDestroy {

  public resolve$ = new BehaviorSubject<{confirm: () => void; abort?: () => void; }>(undefined);

  /** Observable of the active client */
  public client$ = new BehaviorSubject<Client>(undefined);

  /** Observable of the client error, if any */
  public clientError$ = new BehaviorSubject<string>(undefined);

  /** Observable of the active schema */
  public schema$ = new BehaviorSubject<ClientSchema>(undefined);

  /** Subscription to the selected diagram  */
  private selectedDiagram$$: Subscription;

  /** Subscription to the selected parcel year  */
  private selectedParcelYear$$: Subscription;

  /** Subscription to the selected schema  */
  private selectedSchema$$: Subscription;

  /** Current parcel year  */
  private parcelYear: ClientParcelYear = undefined;

  /** Active client */
  get client(): Client { return this.client$.value; }

  /** Active schema */
  get schema(): ClientSchema { return this.schema$.value; }

  /** Store that holds the diagrams of the active client */
  get diagramStore(): EntityStore<ClientParcelDiagram> {
    return this.parcelState.diagramStore;
  }

  /** Store that holds all the "parcel years". This is not on a per client basis. */
  get parcelYearStore(): EntityStore<ClientParcelYear> {
    return this.parcelState.parcelYearStore;
  }

  /** Store that holds the parcels of the active client */
  get parcelStore(): FeatureStore<ClientParcel> {
    return this.parcelState.parcelStore;
  }

  /** Store that holds the schemas of the active client */
  get schemaStore(): EntityStore<ClientSchema> {
    return this.schemaState.schemaStore;
  }

  /** Store that holds the elements of the active schema */
  get schemaElementStore(): FeatureStore<ClientSchemaElement> {
    return this.elementState.elementStore;
  }

  get transaction(): EntityTransaction {
    return this.elementState.transaction;
  }

  constructor(
    private parcelState: ClientParcelState,
    private schemaState: ClientSchemaState,
    private elementState: ClientSchemaElementState,
    private editionState: EditionState,
    private mapState: MapState,
    private clientService: ClientService
  ) {
    this.selectedDiagram$$ = this.diagramStore.stateView
      .firstBy$((record: EntityRecord<ClientParcelDiagram>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientParcelDiagram>) => {
        const diagram = record ? record.entity : undefined;
        this.onSelectDiagram(diagram);
      });

    this.selectedParcelYear$$ = this.parcelYearStore.stateView
      .firstBy$((record: EntityRecord<ClientParcelYear>) => record.state.selected === true)
      .pipe(skip(1))
      .subscribe((record: EntityRecord<ClientParcelYear>) => {
        const parcelYear = record ? record.entity : undefined;
        this.onSelectParcelYear(parcelYear);
      });

    this.selectedSchema$$ = this.schemaStore.stateView
      .firstBy$((record: EntityRecord<ClientSchema>) => record.state.selected === true)
      .subscribe((record: EntityRecord<ClientSchema>) => {
        const schema = record ? record.entity : undefined;
        this.onSelectSchema(schema);
      });
  }

  ngOnDestroy() {
    this.selectedDiagram$$.unsubscribe();
    this.selectedParcelYear$$.unsubscribe();
    this.selectedSchema$$.unsubscribe();
  }

  getClientByNum(clientNum: string): Observable<Client> {
    const annee = this.parcelYear ? this.parcelYear.annee : undefined;
    return this.clientService.getClientByNum(clientNum, annee);
  }

  setClient(client: Client | undefined) {
    if (!this.transaction.empty) {
      this.resolve$.next({confirm: () => this.setClient(client)});
      return;
    }

    this.clearClient();

    if (client === undefined) {
      return;
    }

    this.parcelState.setClient(client);
    this.schemaState.setClient(client);

    this.editionState.store.register(this.parcelState.editor);
    this.editionState.store.register(this.schemaState.editor);
    this.editionState.store.activateEditor(this.parcelState.editor);

    this.client$.next(client);

    if (client.parcels.length === 0) {
      this.clientError$.next('client.error.noparcel');
    } else {
      this.clientError$.next(undefined);
    }
  }

  setClientNotFound() {
    if (!this.transaction.empty) {
      this.resolve$.next({confirm: () => this.setClientNotFound()});
      return;
    }
    this.clearClient();
    this.clientError$.next('client.error.notfound');
  }

  private clearClient() {
    this.clientError$.next(undefined);

    if (this.client === undefined) { return; }

    this.parcelState.setClient(undefined);
    this.schemaState.setClient(undefined);

    this.editionState.store.unregister(this.parcelState.editor);
    this.editionState.store.unregister(this.schemaState.editor);

    this.clearSchema();

    this.client$.next(undefined);
  }

  private onSelectDiagram(diagram: ClientParcelDiagram) {
    this.parcelState.setDiagram(diagram);
  }

  private onSelectParcelYear(parcelYear: ClientParcelYear) {
    this.parcelYear = parcelYear;
    if (this.client !== undefined) {
      this.getClientByNum(this.client.info.numero)
        .subscribe((client?: Client) => this.setClient(client));
    }
  }

  private onSelectSchema(schema: ClientSchema) {
    if (schema !== undefined && this.schema !== undefined && schema.id === this.schema.id) {
      return;
    }
    this.setSchema(schema);
  }

  private setSchema(schema: ClientSchema) {
    if (!this.transaction.empty) {
      this.resolve$.next({
        confirm: () => this.setSchema(schema),
        abort: () => this.schemaStore.state.update(this.schema, {selected: true}, true)
      });
      return;
    }

    this.clearSchema();

    if (schema === undefined) { return; }

    this.parcelStore.state.updateAll({selected: false});
    this.elementState.setSchema(schema);

    this.editionState.store.register(this.elementState.editor);
    this.editionState.store.activateEditor(this.schemaState.editor);

    this.schema$.next(schema);
  }

  private clearSchema() {
    if (this.schema === undefined) { return; }

    this.elementState.setSchema(undefined);
    this.editionState.store.unregister(this.elementState.editor);
    this.editionState.store.activateEditor(this.schemaState.editor);

    this.schema$.next(undefined);
  }

}
