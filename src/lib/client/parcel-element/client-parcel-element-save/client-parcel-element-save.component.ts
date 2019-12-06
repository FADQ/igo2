import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService, Message, MessageType } from '@igo2/core';

import { EntityTransaction, WidgetComponent, OnUpdateInputs } from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElement } from '../shared/client-parcel-element.interfaces';
import { ClientParcelElementService } from '../shared/client-parcel-element.service';

@Component({
  selector: 'fadq-client-parcel-element-save',
  templateUrl: './client-parcel-element-save.component.html',
  styleUrls: ['./client-parcel-element-save.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementSaveComponent implements OnUpdateInputs, WidgetComponent {

  /**
   * Client
   */
  @Input() client: Client;

  /**
   * Parcel annee
   */
  @Input() annee: number;

  /**
   * Parcel element store
   */
  @Input() store: FeatureStore<ClientParcelElement>;

  /**
   * Parcel element transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  get commitHandler(): (transaction: EntityTransaction) => Observable<Message | undefined>  {
    return (transaction: EntityTransaction): Observable<Message | undefined> => this.commitTransaction(transaction);
  }

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

  onComplete(parcelElements: ClientParcelElement[]) {
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  private commitTransaction(transaction: EntityTransaction): Observable<Message | undefined> {
    return this.clientParcelElementService
      .commitTransaction(this.client, this.annee, transaction)
      .pipe(
        map((results: ClientParcelElement[] | Error) => this.onCommitSuccess(results))
      );
  }

  private onCommitSuccess(results: ClientParcelElement[] | Error): Message | undefined {
    if (results instanceof Error) {
      return {
        type: MessageType.ERROR,
        text: this.languageService.translate.instant('client.parcelElement.save.error')
      };
    }

    this.store.layer.dataSource.ol.clear();
    this.store.load(results);

    return {
      type: MessageType.SUCCESS,
      text: this.languageService.translate.instant('client.parcelElement.save.success')
    };
  }

}
