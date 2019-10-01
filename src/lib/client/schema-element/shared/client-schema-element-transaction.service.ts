import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

import {
  ClientSchemaElementTransactionDialogComponent
} from '../client-schema-element-transaction-dialog/client-schema-element-transaction-dialog.component';
import { ClientSchemaElementTransactionWrapper } from './client-schema-element.interfaces';

/**
 * Service that opens a dialog to let a user take action on a transaction
 */
@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementTransactionService {

  constructor(private dialog: MatDialog) {}

  prompt(transaction: ClientSchemaElementTransactionWrapper) {
    this.dialog.open(ClientSchemaElementTransactionDialogComponent, {
      data: {transaction}
    });
  }

}
