import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { SubmitStep, SubmitHandler } from '../../../utils';
import { ClientParcelElementService } from '../../parcel-element/shared/client-parcel-element.service';
import { ClientParcelElementTransactionWrapper } from '../shared/client-parcel-element.interfaces';

@Component({
  selector: 'fadq-client-parcel-element-transaction-dialog',
  templateUrl: 'client-parcel-element-transaction-dialog.component.html',
  styleUrls: ['./client-parcel-element-transaction-dialog.component.scss']
})
export class ClientParcelElementTransactionDialogComponent {

  readonly submitStep = SubmitStep;

  readonly submitHandler = new SubmitHandler();

  get transaction(): ClientParcelElementTransactionWrapper { return this.data.transaction; }

  constructor(
    private clientParcelElementService: ClientParcelElementService,
    public dialogRef: MatDialogRef<ClientParcelElementTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {transaction: ClientParcelElementTransactionWrapper}
  ) {}

  onYesClick() {
    const submit$ =  this.clientParcelElementService
      .commitTransaction(
        this.transaction.client,
        this.transaction.annee,
        this.transaction.transaction
      );

    this.submitHandler.handle(submit$, {
      success: () => this.onCommit()
    }).submit();
  }

  onNoClick() {
    this.transaction.transaction.clear();
    this.transaction.proceed();
    this.dialogRef.close();
  }

  onCancelClick() {
    this.dialogRef.close();
    const abort = this.transaction.abort;
    if (abort !== undefined) {
      abort();
    }
  }

  private onCommit() {
    this.transaction.proceed();
    this.submitHandler.destroy();
    this.dialogRef.close();  
  }

}
