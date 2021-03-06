import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SubmitStep, SubmitHandler } from '../../../utils';
import { ClientSchemaElementService } from '../../schema-element/shared/client-schema-element.service';
import { ClientSchemaElementTransactionWrapper } from '../shared/client-schema-element.interfaces';

@Component({
  selector: 'fadq-client-schema-element-commit-dialog',
  templateUrl: 'client-schema-element-commit-dialog.component.html',
  styleUrls: ['./client-schema-element-commit-dialog.component.scss']
})
export class ClientSchemaElementCommitDialogComponent implements OnDestroy {

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

  get transaction(): ClientSchemaElementTransactionWrapper { return this.data.transaction; }

  constructor(
    private clientSchemaElementService: ClientSchemaElementService,
    public dialogRef: MatDialogRef<ClientSchemaElementCommitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {transaction: ClientSchemaElementTransactionWrapper}
  ) {}

  /**
   * Destroy the submit handler
   * @internal
   */
  ngOnDestroy() {
    this.submitHandler.destroy();
  }

  onYesClick() {
    const submit$ = this.clientSchemaElementService
      .commitTransaction(this.transaction.schema, this.transaction.transaction);

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
