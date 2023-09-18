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

import OlGeoJSON from 'ol/format/GeoJSON';
import * as olFormat from 'ol/format';

import { LanguageService } from '@igo2/core';

import { EntityTransaction, WidgetComponent, OnUpdateInputs } from '@igo2/common';
import { FeatureStore, IgoMap } from '@igo2/geo';

import { getAnneeImageFromMap } from '../../shared/client.utils';
import { EditionResult } from '../../../edition/shared/edition.interfaces';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElement } from '../shared/client-schema-element.interfaces';
import { ClientSchemaElementService } from '../shared/client-schema-element.service';
import {
  generateSchemaElementOperationTitle,
  getSchemaElementValidationMessage,
  processAnneeImageField
} from '../shared/client-schema-element.utils';

@Component({
  selector: 'fadq-client-schema-element-translate',
  templateUrl: './client-schema-element-translate.component.html',
  styleUrls: ['./client-schema-element-translate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementTranslateComponent implements OnUpdateInputs, WidgetComponent {

  /**
   * Map to draw elements on
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
   * Schema element
   */
  @Input() schemaElement: ClientSchemaElement;

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

  /**
   * Process a schema element
   * @param data The client schema element to process
   * @returns The schema element processed
   */
  private processSchemaElement(data: ClientSchemaElement): Observable<EditionResult> {
    return this.clientSchemaElementService.createSchemaElement(this.schema, data)
      .pipe(
        map((schemaElement: ClientSchemaElement): EditionResult => {
          processAnneeImageField(schemaElement, this.clientSchemaElementService,this.map);
          return {
            feature: schemaElement,
            error: getSchemaElementValidationMessage(schemaElement, this.languageService)
          };
        })
      );
  }

}
