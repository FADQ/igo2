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

import { LanguageService } from '@igo2/core';

import { EntityTransaction, WidgetComponent, OnUpdateInputs } from '@igo2/common';
import { FeatureStore, IgoMap } from '@igo2/geo';

import { EditionResult } from '../../../edition/shared/edition.interfaces';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElement } from '../shared/client-schema-element.interfaces';
import { ClientSchemaElementService } from '../shared/client-schema-element.service';
import {
  generateSchemaElementOperationTitle,
  getSchemaElementValidationMessage
} from '../shared/client-schema-element.utils';

@Component({
  selector: 'fadq-client-schema-element-import',
  templateUrl: './client-schema-element-import.component.html',
  styleUrls: ['./client-schema-element-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementImportComponent implements OnUpdateInputs, WidgetComponent {

  /**
   * Map to import elements on
   */
  @Input() map: IgoMap;

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

  get getOperationTitle(): (data: ClientSchemaElement, languageService: LanguageService) => string {
    return generateSchemaElementOperationTitle;
  }

  get processData(): (data: ClientSchemaElement) => Observable<EditionResult> {
    return (data: ClientSchemaElement): Observable<EditionResult> => this.processSchemaElement(data);
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

  private processSchemaElement(data: ClientSchemaElement): Observable<EditionResult> {
    Object.assign(data.properties, {
      idElementGeometrique: undefined,
      description: undefined,
      etiquette: undefined
    });
    return this.clientSchemaElementService.createSchemaElement(this.schema, data)
      .pipe(
        map((schemaElement: ClientSchemaElement | undefined): EditionResult => {
          if (schemaElement === undefined) {
            return undefined;
          }

          if (this.store.get(this.store.getKey(schemaElement)) !== undefined ||
              this.transaction.getOperationByEntity(schemaElement) !== undefined
          ) {
            return undefined;
          }

          const error = getSchemaElementValidationMessage(schemaElement, this.languageService);
          return error === undefined ? {feature: schemaElement} : undefined;
        })
      );
  }

}
