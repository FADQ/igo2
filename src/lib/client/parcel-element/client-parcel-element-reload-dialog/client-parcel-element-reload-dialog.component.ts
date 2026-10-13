import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ClientParcelElementTransactionWrapper } from '../shared/client-parcel-element.interfaces';

@Component({
  selector: 'fadq-client-parcel-element-reload-dialog',
  templateUrl: 'client-parcel-element-reload-dialog.component.html',
  styleUrls: ['./client-parcel-element-reload-dialog.component.scss']
})
export class ClientParcelElementReloadDialogComponent {

  get transaction(): ClientParcelElementTransactionWrapper { return this.data.transaction; }

  constructor(
    public dialogRef: MatDialogRef<ClientParcelElementReloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {transaction: ClientParcelElementTransactionWrapper}
  ) {}

  onYesClick() {
    this.transaction.transaction.clear();
    this.transaction.proceed();
    this.dialogRef.close();
  }

  onNoClick() {
    this.dialogRef.close();
    const abort = this.transaction.abort;
    if (abort !== undefined) {
      abort();
    }
  }

}
