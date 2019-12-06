import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { BehaviorSubject, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { Message, MessageType, LanguageService } from '@igo2/core';
import { EntityStore } from '@igo2/common';

import { SubmitStep, SubmitHandler } from '../../../utils';
import { Client } from '../../shared/client.interfaces';
import { ClientController } from '../../shared/client-controller';
import { ClientParcelElementTxService } from '../../parcel-element/shared/client-parcel-element-tx.service';

@Component({
  selector: 'fadq-client-parcel-element-delete-tx-dialog',
  templateUrl: 'client-parcel-element-delete-tx-dialog.component.html',
  styleUrls: ['./client-parcel-element-delete-tx-dialog.component.scss']
})
export class ClientParcelElementDeleteTxDialogComponent implements OnDestroy {

  /**
   * Message
   * @internal
   */
  message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

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

  get store(): EntityStore<Client> { return this.data.store; }

  get client(): Client { return this.data.client; }

  get annee(): number { return this.data.annee; }

  get controller(): ClientController { return this.data.controller; }

  constructor(
    private clientParcelElementTxService: ClientParcelElementTxService,
    private languageService: LanguageService,
    public dialogRef: MatDialogRef<ClientParcelElementDeleteTxDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {
      store: EntityStore<Client>;
      client: Client;
      annee: number;
      controller: ClientController
    }
  ) {}

  /**
   * Destroy the submit handler
   * @internal
   */
  ngOnDestroy() {
    this.submitHandler.destroy();
  }

  onYesClick() {
    const submit$ = this.clientParcelElementTxService.getClientsInReconcilitation(this.client).pipe(
      concatMap((clients: Client[]) => {
        if (clients.length > 0) {
          return throwError(null);
        }
        return this.clientParcelElementTxService.deleteParcelTx(
          this.client,
          this.annee
        );
      })
    );

    this.submitHandler.handle(submit$, {
      success: () => this.onSubmitSuccess(),
      error: () => this.onSubmitError()
    }).submit();
  }

  onCancelClick() {
    this.dialogRef.close();
  }

  private onSubmitSuccess() {
    if (this.controller !== undefined) {
      this.controller.parcelElementTransaction.clear();
      this.controller.deactivateParcelElements();
    }
    if (this.store !== undefined) {
      this.store.delete(this.client);
    }
    this.submitHandler.destroy();
    this.dialogRef.close();
  }

  private onSubmitError() {
    this.message$.next({
      type: MessageType.ERROR,
      text: this.languageService.translate.instant('client.parcelElement.deleteTx.error.moreThanOneClient')
    });
  }
}
