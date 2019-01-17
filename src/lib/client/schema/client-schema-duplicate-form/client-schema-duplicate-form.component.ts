import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { Subject } from 'rxjs';

import { EntityStore, EntityFormTemplate, EntityFormSubmitEvent } from 'src/lib/entity';
import { WidgetComponent } from 'src/lib/widget';

import { ClientSchema } from '../shared/client-schema.interfaces';
import { ClientSchemaService } from '../shared/client-schema.service';
import { ClientSchemaFormService } from '../shared/client-schema-form.service';

@Component({
  selector: 'fadq-client-schema-duplicate-form',
  templateUrl: './client-schema-duplicate-form.component.html',
  styleUrls: ['./client-schema-duplicate-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaDuplicateFormComponent extends WidgetComponent implements OnInit {

  public template$ = new Subject<EntityFormTemplate>();

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

  constructor(
    private clientSchemaService: ClientSchemaService,
    private clientSchemaFormService: ClientSchemaFormService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.clientSchemaFormService.buildDuplicateForm()
      .subscribe((template: EntityFormTemplate) => this.template$.next(template));
  }

  onSubmit(event: EntityFormSubmitEvent) {
    this.clientSchemaService.duplicateSchema(event.entity as ClientSchema)
      .subscribe((schema: ClientSchema) => this.onSubmitSuccess(schema));
  }

  onCancel() {
    this.cancel.emit();
  }

  private onSubmitSuccess(schema: ClientSchema) {
    if (this.store !== undefined) {
      this.store.addEntities([schema]);
    }
    this.complete.emit();
  }

}
