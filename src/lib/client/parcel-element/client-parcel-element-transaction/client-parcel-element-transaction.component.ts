import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ClientParcelElementService } from '../../parcel-element/shared/client-parcel-element.service';

import { ClientParcelElementTransactionWrapper } from '../shared/client-parcel-element.interfaces';

@Component({
  selector: 'fadq-client-parcel-element-transaction',
  templateUrl: 'client-parcel-element-transaction.component.html',
  styleUrls: ['./client-parcel-element-transaction.component.scss']
})
export class ClientParcelElementTransactionComponent {

  get transaction(): ClientParcelElementTransactionWrapper { return this.data.transaction; }

  constructor(
    private clientParcelElementService: ClientParcelElementService,
    public dialogRef: MatDialogRef<ClientParcelElementTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {transaction: ClientParcelElementTransactionWrapper}
  ) {}

  onYesClick() {
    this.clientParcelElementService
      .commitTransaction(this.transaction.client, this.transaction.transaction)
      .subscribe(() => {
        this.transaction.proceed();
        this.dialogRef.close();
      });
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

}
