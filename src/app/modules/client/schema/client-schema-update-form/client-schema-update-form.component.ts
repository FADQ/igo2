import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { EntityStore, EntityFormTemplate, getEntityId } from 'src/app/modules/entity';
import { WidgetComponent } from 'src/app/modules/widget';

import { ClientSchema, ClientSchemaUpdateData } from '../shared/client-schema.interfaces';
import { ClientSchemaService } from '../shared/client-schema.service';
import { ClientSchemaFormBuilder } from '../shared/client-schema-form-builder';

@Component({
  selector: 'fadq-client-schema-update-form',
  templateUrl: './client-schema-update-form.component.html',
  styleUrls: ['./client-schema-update-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaUpdateFormComponent implements WidgetComponent {

  public template: EntityFormTemplate = ClientSchemaFormBuilder.getUpdateTemplate();

  @Input()
  get schema(): ClientSchema {
    return this._schema;
  }
  set schema(value: ClientSchema) {
    this._schema = value;
    this.cdRef.detectChanges();
  }
  private _schema: ClientSchema;

  @Input()
  get store(): EntityStore<ClientSchema> {
    return this._store;
  }
  set store(value: EntityStore<ClientSchema>) {
    this._store = value;
  }
  private _store;

  @Output() complete = new EventEmitter<ClientSchema>();
  @Output() cancel = new EventEmitter();

  constructor(
    private clientSchemaService: ClientSchemaService,
    private cdRef: ChangeDetectorRef
  ) {}

  onSubmit(event: {entity: ClientSchema, data: { [key: string]: any }}) {
    const data = Object.assign({}, event.data, {
      id: parseInt(getEntityId(event.entity), 10)
    }) as ClientSchemaUpdateData;

    this.clientSchemaService.updateSchema(event.entity, data)
      .subscribe((schema: ClientSchema) => this.onSubmitSuccess(schema));
  }

  onCancel() {
    this.cancel.emit();
  }

  private onSubmitSuccess(schema: ClientSchema) {
    if (this.store !== undefined) {
      this.store.putEntities([schema], true);
    }
    this.complete.emit();
  }

}