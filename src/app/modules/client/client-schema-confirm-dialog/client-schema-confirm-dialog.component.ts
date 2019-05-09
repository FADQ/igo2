import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ClientSchemaElementService } from 'src/lib/client';

import { ClientResolution } from '../shared/client-resolution.service';

@Component({
  selector: 'fadq-client-schema-confirm-dialog',
  templateUrl: 'client-schema-confirm-dialog.component.html',
  styleUrls: ['./client-schema-confirm-dialog.component.scss']
})
export class ClientSchemaConfirmDialogComponent {

  get resolution(): ClientResolution { return this.data.resolution; }

  constructor(
    private clientSchemaElementService: ClientSchemaElementService,
    public dialogRef: MatDialogRef<ClientSchemaConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {resolution: ClientResolution}
  ) {}

  onYesClick() {
    const workspace = this.resolution.workspace;
    const schema = workspace.schema;
    const transaction = workspace.transaction;
    this.clientSchemaElementService
      .commitTransaction(schema, transaction)
      .subscribe(() => {
        this.resolution.proceed();
        this.dialogRef.close();
      });
  }

  onNoClick() {
    this.resolution.workspace.transaction.clear();
    this.resolution.proceed();
    this.dialogRef.close();
  }

  onCancelClick() {
    this.dialogRef.close();
    const abort = this.resolution.abort;
    if (abort !== undefined) {
      abort();
    }
  }

}
