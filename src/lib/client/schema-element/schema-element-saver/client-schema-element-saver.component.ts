import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  EntityOperation,
  EntityOperationType,
  EntityTransaction,
  EntityTableTemplate,
  EntityTableColumnRenderer,
  EntityFormTemplate,
  getEntityId,
  getEntityTitle
} from 'src/lib/entity';
import { WidgetComponent } from 'src/lib/widget';

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElementService } from '../shared/client-schema-element.service';
import { ClientSchemaElementTransactionSerializer } from '../shared/client-schema-element.utils';

@Component({
  selector: 'fadq-client-schema-element-saver',
  templateUrl: './client-schema-element-saver.component.html',
  styleUrls: ['./client-schema-element-saver.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementSaverComponent extends WidgetComponent {

  static operationIcons = {
    [EntityOperationType.Insert]: 'add',
    [EntityOperationType.Update]: 'edit',
    [EntityOperationType.Delete]: 'delete'
  };

  static tableTemplate: EntityTableTemplate = {
    selection: false,
    sort: false,
    columns: [
      {
        name: 'type',
        title: 'Opération',
        renderer: EntityTableColumnRenderer.Icon,
        valueAccessor: (operation: EntityOperation) => {
          return ClientSchemaElementSaverComponent.operationIcons[operation.type];
        }
      },
      {
        name: 'title',
        title: 'Élément',
        valueAccessor: (operation: EntityOperation) => {
          return getEntityTitle(operation) || getEntityId(operation);
        }
      }
    ]
  };

  static formTemplate: EntityFormTemplate = {
    fields: []
  };

  @Input()
  get schema(): ClientSchema {
    return this._schema;
  }
  set schema(value: ClientSchema) {
    if (this.schema !== undefined) {
      return;
    }
    this._schema = value;
  }
  private _schema: ClientSchema;

  @Input()
  get transaction(): EntityTransaction {
    return this._transaction;
  }
  set transaction(value: EntityTransaction) {
    if (this.transaction !== undefined) {
      return;
    }
    this._transaction = value;
  }
  private _transaction;

  get tableTemplate(): EntityTableTemplate {
    return ClientSchemaElementSaverComponent.tableTemplate;
  }

  get formTemplate(): EntityFormTemplate {
    return ClientSchemaElementSaverComponent.formTemplate;
  }

  constructor(
    private clientSchemaElementService: ClientSchemaElementService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
  }

  onOperationClick(operation: EntityOperation) {
    const store = operation.store;
    const entity = operation.current;
    if (store !== undefined && entity !== undefined) {
      store.updateEntityState(entity, {selected: true}, true);
    }
  }

  onSubmit() {
    this.transaction
      .commit((transaction: EntityTransaction, operations: EntityOperation[]) => {
        const serializer = new ClientSchemaElementTransactionSerializer();
        const data = serializer.serializeOperations(operations);
        return this.clientSchemaElementService.saveElements(this.schema, data);
      }).subscribe(() => this.onSubmitSuccess());
  }

  onCancel() {
    this.cancel.emit();
  }

  private onSubmitSuccess() {
    this.complete.emit();
  }

}
