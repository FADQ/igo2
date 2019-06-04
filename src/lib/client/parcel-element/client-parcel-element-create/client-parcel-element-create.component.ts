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

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  EntityTransaction,
  Form,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { FeatureStore, IgoMap } from '@igo2/geo';

import { EditionResult } from '../../../edition/shared/edition.interfaces';
import { ClientParcelElement } from '../shared/client-parcel-element.interfaces';
import { ClientParcelElementService } from '../shared/client-parcel-element.service';
import { ClientParcelElementFormService } from '../shared/client-parcel-element-form.service';

import {
  generateParcelElementOperationTitle,
  getParcelElementValidationMessage
} from '../shared/client-parcel-element.utils';

@Component({
  selector: 'fadq-client-parcel-element-create-form',
  templateUrl: './client-parcel-element-create.component.html',
  styleUrls: ['./client-parcel-element-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementCreateComponent
    implements OnInit, OnDestroy, OnUpdateInputs, WidgetComponent {

  /**
   * Create form
   * @internal
   */
  form$ = new BehaviorSubject<Form>(undefined);

  /**
   * Create form
   * @internal
   */
  groupIndex$ = new BehaviorSubject<number>(0);

  /**
   * Subscription to the value changes event
   */
  private geometry$$: Subscription;

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
    private clientParcelElementFormService: ClientParcelElementFormService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientParcelElementFormService
      .buildCreateForm(this.map)
      .subscribe((form: Form) => this.setForm(form));
  }

  ngOnDestroy() {
    if (this.geometry$$ !== undefined) {
      this.geometry$$.unsubscribe();
      this.geometry$$ = undefined;
    }
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onComplete(parcelElement: ClientParcelElement) {
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

  private setForm(form: Form) {
    this.form$.next(form);
  }

}
