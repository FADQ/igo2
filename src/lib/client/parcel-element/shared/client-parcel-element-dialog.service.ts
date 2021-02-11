import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  ClientParcelElementCommitDialogComponent
} from '../client-parcel-element-commit-dialog/client-parcel-element-commit-dialog.component';
import {
  ClientParcelElementReloadDialogComponent
} from '../client-parcel-element-reload-dialog/client-parcel-element-reload-dialog.component';
import { ClientParcelElementTransactionWrapper } from './client-parcel-element.interfaces';

/**
 * Service that opens a dialog to let a user take action on a transaction
 */
@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementDialogService {

  constructor(private dialog: MatDialog) {}

  promptCommit(transaction: ClientParcelElementTransactionWrapper) {
    this.dialog.open(ClientParcelElementCommitDialogComponent, {
      data: {transaction}
    });
  }

  promptReload(transaction: ClientParcelElementTransactionWrapper) {
    this.dialog.open(ClientParcelElementReloadDialogComponent, {
      data: {transaction}
    });
  }

}
