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

import { EntityStore, Form, WidgetComponent, OnUpdateInputs } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { formToJSON } from '../../../utils/conversion';
import { Client } from '../../shared/client.interfaces';
import { ClientSchema, ClientSchemaCreateData } from '../shared/client-schema.interfaces';
import { ClientSchemaService } from '../shared/client-schema.service';
import { ClientSchemaFormService } from '../shared/client-schema-form.service';
import { UniqueClientSchemaType } from '../shared/client-schema.enums';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'fadq-client-schema-create',
  templateUrl: './client-schema-create.component.html',
  styleUrls: ['./client-schema-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaCreateComponent implements OnInit, OnUpdateInputs, WidgetComponent {

  /**
   * Create form
   */
  form$ = new BehaviorSubject<Form>(undefined);

  /**
   * Client
   */
  @Input() client: Client;

  /**
   * Schema store
   */
  @Input() store: EntityStore<ClientSchema>;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private clientSchemaService: ClientSchemaService,
    private clientSchemaFormService: ClientSchemaFormService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientSchemaFormService.buildCreateForm(this.store)
      .subscribe((form: Form) => {
        this.setDescription(form);
        this.form$.next(form);
      });
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit(data: {[key: string]: any}) {
    const schemaData = Object.assign({
      numeroClient: this.client.info.numero
    }, formToJSON(this.form$.value)) as ClientSchemaCreateData;

    this.clientSchemaService.createSchema(schemaData)
      .subscribe((schema: ClientSchema) => this.onSubmitSuccess(schema));
  }

  onCancel() {
    this.cancel.emit();
  }

  private onSubmitSuccess(schema: ClientSchema) {
    this.store.insert(schema);
    this.store.state.update(schema, {selected: true}, true);
    this.complete.emit();
  }

  private setDescription(form: Form) {
    const formInfo = form.control.get('info') as FormControl;
    formInfo.get('type').valueChanges.subscribe(() => {
      const schemaTypeControl = formInfo.get('type') as FormControl;
      const schemaType = schemaTypeControl.value;
      const descriptionControl = formInfo.get('description') as FormControl;
      if (schemaType in UniqueClientSchemaType && descriptionControl !== undefined) {
        formInfo.patchValue({description: this.languageService.translate.instant('client.schema.description.' + schemaType)}, {onlySelf: true, emitEvent: true});
        descriptionControl.disable({onlySelf: true, emitEvent: true});
      }else {
        if (descriptionControl.value === this.languageService.translate.instant('client.schema.description.LSE') ||
            descriptionControl.value === this.languageService.translate.instant('client.schema.description.RPA')) {
          descriptionControl.reset(null);
          descriptionControl.setValue('', {onlySelf: true, emitEvent: true});
          }
          descriptionControl.enable({onlySelf: true, emitEvent: true});
      }
    });
  }
}
