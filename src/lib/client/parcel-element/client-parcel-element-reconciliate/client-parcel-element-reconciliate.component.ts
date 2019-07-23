import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';

import { BehaviorSubject, Subscription, combineLatest, of } from 'rxjs';
import { catchError, debounceTime } from 'rxjs/operators';

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
export class ClientParcelElementReconciliateComponent
    implements WidgetComponent, OnUpdateInputs, OnInit, OnDestroy {

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
   * Title
   * @internal
   */
  readonly title$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * Icon
   * @internal
   */
  readonly icon$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * Icon color
   * @internal
   */
  readonly iconColor$: BehaviorSubject<string> = new BehaviorSubject(undefined);

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

  private submit$$: Subscription;

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

    this.submit$$ = combineLatest(this.submitted$, this.submitError$).pipe(
      debounceTime(10)
    ).subscribe((bunch: [boolean, boolean]) => this.updateHeader(...bunch));
  }

  ngOnDestroy() {
    this.submit$$.unsubscribe();
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

  private updateHeader(submitted: boolean, submitError: boolean) {
    let icon, iconColor, title;
    if (submitted === false) {
      icon = 'help-circle';
      iconColor = 'accent';
      title = 'client.parcelElement.reconciliate.confirm';
    } else {
      if (submitError === true) {
        icon = 'thumb-down';
        iconColor = 'warn';
        title = 'client.parcelElement.reconciliate.error';
      } else {
        icon = 'thumb-up';
        iconColor = 'accent';
        title = 'client.parcelElement.reconciliate.success';
      }
    }

    this.icon$.next(icon);
    this.iconColor$.next(iconColor);
    this.title$.next(this.languageService.translate.instant(title));
  }
}
