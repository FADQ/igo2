import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { LanguageService, Message, MessageType } from '@igo2/core';
import {
  EntityStore,
  EntityTableTemplate,
  WidgetComponent,
  OnUpdateInputs,
  EntityTableColumnRenderer
} from '@igo2/common';

import { SubmitStep, SubmitHandler } from '../../../utils';
import { Client } from '../../shared/client.interfaces';
import { ClientParcelTxService } from '../shared/client-parcel-tx.service';
import { ClientInReconciliationResponseData, ClientInReconciliationResponse } from '../shared/client-parcel-tx.interfaces';

@Component({
  selector: 'fadq-client-parcel-tx-reconciliate',
  templateUrl: './client-parcel-tx-reconciliate.component.html',
  styleUrls: ['./client-parcel-tx-reconciliate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelTxReconciliateComponent
    implements WidgetComponent, OnUpdateInputs, OnInit, OnDestroy {

   /**
   * Determines whether edition$ in
   */
    isBlocked$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  /**
   * Message
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Submit step enum
   * @internal
   */
  readonly submitStep = SubmitStep;

  /**
   * Submit handler
   * @internal
   */
  readonly submitHandler = new SubmitHandler();

  /**
   * Clients in reconciliation store
   * @internal
   */
  readonly clientStore: EntityStore<ClientInReconciliationResponseData> = new EntityStore([], {
    getKey: (client: ClientInReconciliationResponseData) => client.numeroClient
  });

  /**
   * Transaction operations table template
   * @internal
   */
  tableTemplate: EntityTableTemplate = {
    selection: false,
    sort: false,
    fixedHeader: true,
      headerClassFunc: (() => {
        return {'text-centered': true};
      }),
      rowClassFunc: ((client: ClientInReconciliationResponseData) => {
        return {'text-centered': true};
      }),
    columns: [
      {
        name: 'numeroClient',
        title: 'No. de client'
      },
      {
        name: 'nomClient',
        title: 'Nom'
      },
      {
        name: 'sensAsso',
        title: 'Association'
      },
      {
        name: 'indiBloque',
        title: 'Bloquant',
        renderer: EntityTableColumnRenderer.HTML,
        valueAccessor: (client: ClientInReconciliationResponseData) => {
          return client.indiBloque === 'O' ? 'Oui' : 'Non';
        }
      }
    ]
  };

  /**
   * Client
   */
  @Input() client: Client;

  /**
   * Parcel annee
   */
  @Input() annee: number;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private clientParcelTxService: ClientParcelTxService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Load clients in reconciliation
   * @internal
   */
  ngOnInit() {
    this.clientParcelTxService.getClientsInReconcilitation(this.client, this.annee)
      .subscribe((clients: ClientInReconciliationResponseData[]) => {
        this.clientStore.load(clients);
        let recIsBlocked: boolean = false;
        clients.forEach(element => {
          if (element.indiBloque === 'O') {
            recIsBlocked = true;
          }
        });
        this.isBlocked$.next(recIsBlocked);
      });
  }

  /**
   * Destroy the submit handler
   * @internal
   */
  ngOnDestroy() {
    this.submitHandler.destroy();
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit() {
    const submit$ = this.clientParcelTxService.reconciliate(this.client, this.annee);
    this.submitHandler.handle(submit$, {
      error: () => this.onSubmitError(),
      success: () => this.onSubmitSuccess()
    }).submit();

  }

  onCancel() {
    this.submitHandler.destroy();
    this.cancel.emit();
  }

  onClose() {
    this.complete.emit();
  }

  private onSubmitError() {
    const messageKey = 'client.parcelTx.reconciliate.error';
    const messageType = MessageType.ERROR;
    const text = this.languageService.translate.instant(messageKey);
    this.message$.next({type: messageType, text});
  }

  private onSubmitSuccess() {
    const messageKey = 'client.parcelTx.reconciliate.success';
    const messageType = MessageType.SUCCESS;
    const text = this.languageService.translate.instant(messageKey);
    this.message$.next({type: messageType, text});
  }
}
