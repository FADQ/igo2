import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

import {
  ClientParcelElementTransactionDialogComponent
} from '../client-parcel-element-transaction-dialog/client-parcel-element-transaction-dialog.component';
import { ClientParcelElementTransactionWrapper } from './client-parcel-element.interfaces';

/**
 * Service that opens a dialog to let a user take action on a transaction
 */
@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementTransactionService {

  constructor(private dialog: MatDialog) {}

  prompt(transaction: ClientParcelElementTransactionWrapper) {
    this.dialog.open(ClientParcelElementTransactionDialogComponent, {
      data: {transaction}
    });
  }

}
