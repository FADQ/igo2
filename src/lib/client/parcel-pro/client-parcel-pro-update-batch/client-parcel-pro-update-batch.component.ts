import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  EntityTransaction,
  Form,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { FeatureStore } from '@igo2/geo';

import { EditionResult } from '../../../edition/shared/edition.interfaces';
import { ClientParcelPro } from '../shared/client-parcel-pro.interfaces';
import { ClientParcelProService } from '../shared/client-parcel-pro.service';
import { ClientParcelProFormService } from '../shared/client-parcel-pro-form.service';

import {
  generateParcelProOperationTitle,
} from '../shared/client-parcel-pro.utils';

@Component({
  selector: 'fadq-client-parcel-pro-update-batch',
  templateUrl: './client-parcel-pro-update-batch.component.html',
  styleUrls: ['./client-parcel-pro-update-batch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelProUpdateBatchComponent
    implements OnInit, OnUpdateInputs, WidgetComponent {

  /**
   * Update form
   * @internal
   */
  form$ = new BehaviorSubject<Form>(undefined);

  /**
   * Parcel pro store
   */
  @Input() store: FeatureStore<ClientParcelPro>;

  /**
   * Parcel pro transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Parcel pros
   */
  @Input() parcelPros: ClientParcelPro[];

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  get getOperationTitle(): (data: ClientParcelPro, languageService: LanguageService) => string  {
    return generateParcelProOperationTitle;
  }

  get processData(): (data: ClientParcelPro) => Observable<EditionResult>  {
    return (data: ClientParcelPro): Observable<EditionResult> => this.processParcelPro(data);
  }

  constructor(
    private clientParcelProService: ClientParcelProService,
    private clientParcelProFormService: ClientParcelProFormService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientParcelProFormService
      .buildUpdateBatchForm()
      .subscribe((form: Form) => this.setForm(form));
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onComplete(parcelPro: ClientParcelPro) {
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  private processParcelPro(data: ClientParcelPro): Observable<EditionResult> {
    return this.clientParcelProService.createParcelPro(data)
      .pipe(
        map((parcelPro: ClientParcelPro): EditionResult => {
          return {
            feature: parcelPro,
            error: undefined
          };
        })
      );
  }

  private setForm(form: Form) {
    this.form$.next(form);
  }

}
