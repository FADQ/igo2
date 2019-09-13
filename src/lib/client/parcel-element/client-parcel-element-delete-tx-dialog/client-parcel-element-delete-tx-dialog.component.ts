import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { EntityStore } from '@igo2/common';

import { SubmitStep, SubmitHandler } from '../../../utils';
import { ClientInTx } from '../shared/client-parcel-element.interfaces';
import { ClientController } from '../../shared/client-controller';
import { ClientParcelElementService } from '../../parcel-element/shared/client-parcel-element.service';

@Component({
  selector: 'fadq-client-parcel-element-delete-tx-dialog',
  templateUrl: 'client-parcel-element-delete-tx-dialog.component.html',
  styleUrls: ['./client-parcel-element-delete-tx-dialog.component.scss']
})
export class ClientParcelElementDeleteTxDialogComponent {

  readonly submitStep = SubmitStep;

  readonly submitHandler = new SubmitHandler();

  get store(): EntityStore<ClientInTx> { return this.data.store; }

  get client(): ClientInTx { return this.data.client; }

  get annee(): number { return this.data.annee; }

  get controller(): ClientController { return this.data.controller; }

  constructor(
    private clientParcelElementService: ClientParcelElementService,
    public dialogRef: MatDialogRef<ClientParcelElementDeleteTxDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {
      store: EntityStore<ClientInTx>;
      client: ClientInTx;
      annee: number;
      controller: ClientController
    }
  ) {}

  onYesClick() {
    const submit$ = this.clientParcelElementService.deleteParcelTx(
      this.client,
      this.annee
    );
    this.submitHandler.handle(submit$, {
      success: () => this.onSubmitSuccess()
    }).submit();
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onCancelClick() {
    this.dialogRef.close();
  }

  private onSubmitSuccess() {
    if (this.controller !== undefined) {
      this.controller.stopParcelTx();
    }
    if (this.store !== undefined) {
      this.store.delete(this.client);
    }
    this.submitHandler.destroy();
    this.dialogRef.close();
  }
}
