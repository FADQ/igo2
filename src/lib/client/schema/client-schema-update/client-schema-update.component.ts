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

import { formToJSON } from '../../../utils/conversion';
import { Client } from '../../shared/client.interfaces';
import { ClientSchema, ClientSchemaUpdateData } from '../shared/client-schema.interfaces';
import { ClientSchemaService } from '../shared/client-schema.service';
import { ClientSchemaFormService } from '../shared/client-schema-form.service';

@Component({
  selector: 'fadq-client-schema-update',
  templateUrl: './client-schema-update.component.html',
  styleUrls: ['./client-schema-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaUpdateComponent implements OnInit, OnUpdateInputs, WidgetComponent {

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
   * Schema to update
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

  constructor(
    private clientSchemaService: ClientSchemaService,
    private clientSchemaFormService: ClientSchemaFormService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientSchemaFormService.buildUpdateForm(this.store, this.schema)
      .subscribe((form: Form) => this.form$.next(form));
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit(data: {[key: string]: any}) {
    const schemaData = Object.assign({}, formToJSON(this.form$.value) as Partial<ClientSchemaUpdateData>, {
      id: this.schema.id,
    }) as ClientSchemaUpdateData;

    this.clientSchemaService.updateSchema(this.schema, schemaData)
      .subscribe((schema: ClientSchema) => this.onSubmitSuccess(schema));
  }

  onCancel() {
    this.cancel.emit();
  }

  private onSubmitSuccess(schema: ClientSchema) {
    this.store.update(schema);
    this.complete.emit();
  }
}
