import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Subject, Subscription } from 'rxjs';

import {
  Client,
  ClientService,
  ClientParcelYear,
  ClientParcelYearService
} from 'src/lib/client';

import { ClientSchemaConfirmDialogComponent } from '../client-schema-confirm-dialog/client-schema-confirm-dialog.component';
import { ClientWorkspace } from './client-workspace';


export interface ClientResolution {
  proceed: () => void;
  abort?: () => void;
  workspace: ClientWorkspace;
}

/**
 * Service that holds the state of the client module
 */
@Injectable({
  providedIn: 'root'
})
export class ClientResolutionService implements OnDestroy {

  /** Observable of a pending resolution */
  private resolution$ = new Subject<ClientResolution>();

  private resolution$$: Subscription;

  constructor(private dialog: MatDialog) {
    this.resolution$$ = this.resolution$
      .subscribe((resolution: ClientResolution) => {
        if (resolution !== undefined) {
          this.openResolutionDialog(resolution);
        }
      });
  }

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  enqueue(resolution: ClientResolution) {
    this.resolution$.next(resolution);
  }

  private openResolutionDialog(resolution: ClientResolution): void {
    this.dialog.open(ClientSchemaConfirmDialogComponent, {
      data: {resolution}
    });
  }

}
