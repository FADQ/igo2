import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  ClientSchemaElementCommitDialogComponent
} from '../client-schema-element-commit-dialog/client-schema-element-commit-dialog.component';
import { ClientSchemaElementTransactionWrapper } from './client-schema-element.interfaces';

/**
 * Service that opens a dialog to let a user take action on a transaction
 */
@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementDialogService {

  constructor(private dialog: MatDialog) {}

  promptCommit(transaction: ClientSchemaElementTransactionWrapper) {
    this.dialog.open(ClientSchemaElementCommitDialogComponent, {
      data: {transaction}
    });
  }

}
