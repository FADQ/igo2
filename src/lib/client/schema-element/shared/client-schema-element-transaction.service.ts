import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Subject, Subscription } from 'rxjs';

import {
  ClientSchemaElementTransactionComponent
} from '../client-schema-element-transaction/client-schema-element-transaction.component';
import { ClientSchemaElementTransactionWrapper } from './client-schema-element.interfaces';

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementTransactionService implements OnDestroy {

  /** Observable of a pending transaction */
  private transaction$ = new Subject<ClientSchemaElementTransactionWrapper>();

  private transaction$$: Subscription;

  constructor(private dialog: MatDialog) {
    this.transaction$$ = this.transaction$
      .subscribe((transaction: ClientSchemaElementTransactionWrapper) => {
        if (transaction !== undefined) {
          this.openTransactionDialog(transaction);
        }
      });
  }

  ngOnDestroy() {
    this.transaction$$.unsubscribe();
  }

  enqueue(transaction: ClientSchemaElementTransactionWrapper) {
    this.transaction$.next(transaction);
  }

  private openTransactionDialog(transaction: ClientSchemaElementTransactionWrapper): void {
    this.dialog.open(ClientSchemaElementTransactionComponent, {
      data: {transaction}
    });
  }

}
