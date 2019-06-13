import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { Message } from '@igo2/core';
import {
  EntityOperation,
  EntityOperationType,
  EntityTransaction,
  EntityTableTemplate,
  EntityTableColumnRenderer,
  getEntityId,
  getEntityTitle,
  WidgetComponent
} from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

@Component({
  selector: 'fadq-edition-save',
  templateUrl: './edition-save.component.html',
  styleUrls: ['./edition-save.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionSaveComponent implements WidgetComponent {

  static operationIcons = {
    [EntityOperationType.Insert]: 'plus',
    [EntityOperationType.Update]: 'pencil',
    [EntityOperationType.Delete]: 'delete'
  };

  /**
   * Error or success message, if any
   * @internal
   */
  message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  submitted$: BehaviorSubject<boolean> = new BehaviorSubject(false); 

  tableTemplate: EntityTableTemplate = {
    selection: false,
    sort: false,
    columns: [
      {
        name: 'type',
        title: 'Opération',
        renderer: EntityTableColumnRenderer.Icon,
        valueAccessor: (operation: EntityOperation) => {
          return EditionSaveComponent.operationIcons[operation.type];
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

  /**
   * Schema element store
   */
  @Input() store: FeatureStore;

  /**
   * Transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Process data before submit
   */
  @Input() commitHandler: (transaction: EntityTransaction) => Observable<Message | undefined>;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor() {}

  onSubmit() {
    this.commitHandler(this.transaction)
      .subscribe((message?: Message) => this.onCommit(message));
  }

  onCancel() {
    this.cancel.emit();
  }

  onOperationClick(operation: EntityOperation) {
    const store = operation.store;
    const entity = operation.current;
    if (store !== undefined && entity !== undefined) {
      store.state.update(entity, {selected: true}, true);
    }
  }

  private onCommit(message?: Message) {
    this.message$.next(message);
    if (message === undefined) {
      this.complete.emit();
    }
    this.submitted$.next(true);
  }

}
