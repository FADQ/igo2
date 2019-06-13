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

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElement } from '../shared/client-schema-element.interfaces';
import { ClientSchemaElementService } from '../shared/client-schema-element.service';
import {
  generateSchemaElementOperationTitle,
  getSchemaElementValidationMessage
} from '../shared/client-schema-element.utils';

@Component({
  selector: 'fadq-client-schema-element-save',
  templateUrl: './client-schema-element-save.component.html',
  styleUrls: ['./client-schema-element-save.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementSaveComponent implements OnUpdateInputs, WidgetComponent {

  /**
   * Schema element store
   */
  @Input() store: FeatureStore<ClientSchemaElement>;

  /**
   * Schema element transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Schema
   */
  @Input() schema: ClientSchema;

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
    private clientSchemaElementService: ClientSchemaElementService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onComplete(schemaElements: ClientSchemaElement[]) {
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  private commitTransaction(transaction: EntityTransaction): Observable<Message | undefined> {
    return this.clientSchemaElementService
      .commitTransaction(this.schema, transaction)
      .pipe(
        map((results: Array<ClientSchemaElement[] | Error>) => this.onCommitSuccess(results))
      );
  }

  private onCommitSuccess(results: Array<ClientSchemaElement[] | Error>): Message | undefined {
    let hasError = false;
    const schemaElementsToLoad = [];

    results.forEach((result: ClientSchemaElement[] | Error) => {
      if (result instanceof Error) {
        hasError = true;
        const geometryType = result.message;
        const schemaElementsOfType = this.store.all().filter((schemaElement: ClientSchemaElement) => {
          return schemaElement.geometry.type === geometryType;
        });
        schemaElementsToLoad.push(...schemaElementsOfType);
      } else {
        schemaElementsToLoad.push(...result);
      }
    });

    // Reload everyting. Data that hasn't been saved because of an error
    // is also reloaded but is not obtained from the service.
    this.store.load(schemaElementsToLoad);

    if (hasError) {
      return {
        type: MessageType.ERROR,
        text: this.languageService.translate.instant('client.schemaElement.save.error')
      };
    }

    return {
      type: MessageType.SUCCESS,
      text: this.languageService.translate.instant('client.schemaElement.save.success')
    };
      
  }

}
