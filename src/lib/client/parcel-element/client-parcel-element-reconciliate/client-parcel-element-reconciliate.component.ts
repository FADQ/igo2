import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  EntityStore,
  EntityTableTemplate,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElementService } from '../shared/client-parcel-element.service';

@Component({
  selector: 'fadq-client-parcel-element-reconciliate',
  templateUrl: './client-parcel-element-reconciliate.component.html',
  styleUrls: ['./client-parcel-element-reconciliate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementReconciliateComponent implements WidgetComponent, OnUpdateInputs, OnInit {

  /**
   * Submitted flag
   * @internal
   */
  readonly submitted$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Whether there was a submit error
   * @internal
   */
  readonly submitError$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Clients in reconciliation store
   * @internal
   */
  readonly clientStore: EntityStore<Client> = new EntityStore([], {
    getKey: (client: Client) => client.info.numero
  });

  /**
   * Transaction operations table template
   * @internal
   */
  readonly tableTemplate: EntityTableTemplate = {
    selection: false,
    sort: false,
    columns: [
      {
        name: 'info.numero',
        title: 'No. de client'
      },
      {
        name: 'info.nom',
        title: 'Nom'
      }
    ]
  };

  /**
   * Client
   */
  @Input() client: Client;

  /**
   * Parcel annee
   */
  @Input() annee: number;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private clientParcelElementService: ClientParcelElementService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientParcelElementService.getClientsInReconcilitation(this.client)
      .subscribe((clients: Client[]) => this.clientStore.load(clients));
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit() {
    this.clientParcelElementService.reconciliate(this.client, this.annee).pipe(
      catchError(() => of(new Error()))
    ).subscribe((response: Error | unknown) => {
      if (response instanceof Error) {
        this.onReconciliationError();
      } else {
        this.onReconciliationSuccess();
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  onClose() {
    this.complete.emit();
  }

  private onReconciliationError() {
    this.submitted$.next(true);
    this.submitError$.next(true);
  }

  private onReconciliationSuccess() {
    this.submitted$.next(true);
    this.submitError$.next(false);
  }

}
