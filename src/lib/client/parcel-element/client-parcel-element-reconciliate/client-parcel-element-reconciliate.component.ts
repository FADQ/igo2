import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { LanguageService, Message, MessageType } from '@igo2/core';
import { WidgetComponent, OnUpdateInputs } from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

import { ClientParcelElement } from '../shared/client-parcel-element.interfaces';

@Component({
  selector: 'fadq-client-parcel-element-reconciliate',
  templateUrl: './client-parcel-element-reconciliate.component.html',
  styleUrls: ['./client-parcel-element-reconciliate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementReconciliateComponent implements WidgetComponent, OnUpdateInputs, OnInit {

  /**
   * Success or error message
   * @internal
   */
  message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Parcel element store
   */
  @Input() store: FeatureStore<ClientParcelElement>;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  get hasError(): boolean {
    return this.message$.value !== undefined && this.message$.value.type === MessageType.ERROR;
  }

  constructor(
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const error = this.store.all().find((parcelElement: ClientParcelElement) => {
      const errors = parcelElement.meta.errors || [];
      return errors.length > 0; 
    });

    if (error !== undefined) {
      const text = this.languageService.translate.instant('client.parcelElement.reconciliate.invalid');
      this.message$.next({
        type: MessageType.ERROR,
        text
      });
    }
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit() {
    if (this.hasError) {
      return;
    }
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

}
