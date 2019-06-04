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
import { ClientParcelElement } from '../shared/client-parcel-element.interfaces';
import { ClientParcelElementService } from '../shared/client-parcel-element.service';
import {
  generateParcelElementOperationTitle,
  getParcelElementValidationMessage
} from '../shared/client-parcel-element.utils';

@Component({
  selector: 'fadq-client-parcel-element-fill',
  templateUrl: './client-parcel-element-fill.component.html',
  styleUrls: ['./client-parcel-element-fill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementFillComponent implements OnUpdateInputs, WidgetComponent {

  /**
   * Map to draw elements on
   */
  @Input() map: IgoMap;

  /**
   * Parcel element store
   */
  @Input() store: FeatureStore<ClientParcelElement>;

  /**
   * Parcel element transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Parcel element
   */
  @Input() parcelElement: ClientParcelElement;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  get getOperationTitle(): (data: ClientParcelElement, languageService: LanguageService) => string  {
    return generateParcelElementOperationTitle;
  }
  
  get processData(): (data: ClientParcelElement) => Observable<EditionResult>  {
    return (data: ClientParcelElement): Observable<EditionResult> => this.processParcelElement(data);
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

  private processParcelElement(data: ClientParcelElement): Observable<EditionResult> {
    return this.clientParcelElementService.createParcelElement(data)
      .pipe(
        map((parcelElement: ClientParcelElement): EditionResult => {
          return {
            feature: parcelElement,
            error: getParcelElementValidationMessage(parcelElement, this.languageService)
          }
        })
      )
  }

}
