import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Subject, Subscription } from 'rxjs';

import {
  ClientParcelElementTransactionDialogComponent
} from '../client-parcel-element-transaction-dialog/client-parcel-element-transaction-dialog.component';
import { ClientParcelElementTransactionWrapper } from './client-parcel-element.interfaces';

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementTransactionService implements OnDestroy {

  /** Observable of a pending transaction */
  private transaction$ = new Subject<ClientParcelElementTransactionWrapper>();

  private transaction$$: Subscription;

  constructor(private dialog: MatDialog) {
    this.transaction$$ = this.transaction$
      .subscribe((transaction: ClientParcelElementTransactionWrapper) => {
        if (transaction !== undefined) {
          this.openTransactionDialog(transaction);
        }
      });
  }

  ngOnDestroy() {
    this.transaction$$.unsubscribe();
  }

  enqueue(transaction: ClientParcelElementTransactionWrapper) {
    this.transaction$.next(transaction);
  }

  private openTransactionDialog(transaction: ClientParcelElementTransactionWrapper): void {
    this.dialog.open(ClientParcelElementTransactionDialogComponent, {
      data: {transaction}
    });
  }

}
