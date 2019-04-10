import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'fadq-client-schema-confirm-dialog',
  templateUrl: 'client-schema-confirm-dialog.component.html',
  styleUrls: ['./client-schema-confirm-dialog.component.scss']
})
export class ClientSchemaConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ClientSchemaConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
