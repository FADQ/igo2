import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import { WidgetComponent, OnUpdateInputs } from '@igo2/common';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElementService } from '../shared/client-parcel-element.service';

@Component({
  selector: 'fadq-client-parcel-element-reconciliate',
  templateUrl: './client-parcel-element-reconciliate.component.html',
  styleUrls: ['./client-parcel-element-reconciliate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementReconciliateComponent implements WidgetComponent, OnUpdateInputs {

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
