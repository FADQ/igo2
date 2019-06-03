import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ClientSchemaElementService } from '../../schema-element/shared/client-schema-element.service';

import { ClientSchemaElementTransactionWrapper } from '../shared/client-schema-element.interfaces';

@Component({
  selector: 'fadq-client-schema-element-transaction',
  templateUrl: 'client-schema-element-transaction.component.html',
  styleUrls: ['./client-schema-element-transaction.component.scss']
})
export class ClientSchemaElementTransactionComponent {

  get transaction(): ClientSchemaElementTransactionWrapper { return this.data.transaction; }

  constructor(
    private clientSchemaElementService: ClientSchemaElementService,
    public dialogRef: MatDialogRef<ClientSchemaElementTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {transaction: ClientSchemaElementTransactionWrapper}
  ) {}

  onYesClick() {
    this.clientSchemaElementService
      .commitTransaction(this.transaction.schema, this.transaction.transaction)
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
