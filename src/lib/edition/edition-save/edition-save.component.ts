import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnDestroy
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

import { SubmitStep, SubmitHandler } from '../../utils';

@Component({
  selector: 'fadq-edition-save',
  templateUrl: './edition-save.component.html',
  styleUrls: ['./edition-save.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionSaveComponent implements WidgetComponent, OnDestroy {

  static operationIcons = {
    [EntityOperationType.Insert]: 'plus',
    [EntityOperationType.Update]: 'pencil',
    [EntityOperationType.Delete]: 'delete'
  };

  /**
   * Error or success message, if any
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  readonly submitStep = SubmitStep;

  readonly submitHandler = new SubmitHandler();

  /**
   * Transaction operations table template
   * @internal
   */
  readonly tableTemplate: EntityTableTemplate = {
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
   * Optional title
   */
  @Input() title: string;

  /**
   * Feature store
   */
  @Input() store: FeatureStore;

  /**
   * Transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Commit handler
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

  ngOnDestroy() {
    this.submitHandler.destroy();
  }

  /**
   * Commit transaction
   * @internal
   */
  onSubmit() {
    const submit$ = this.commitHandler(this.transaction);
    this.submitHandler.handle(submit$, {
      success: (message?: Message) => this.onCommit(message)
    }).submit();
  }

  /**
   * Event emitted on cancel
   */
  onCancel() {
    this.submitHandler.destroy();
    this.cancel.emit();
  }

  /**
   * On operation click, select the associated feature
   * @param operation Operation
   * @internal
   */
  onOperationClick(operation: EntityOperation) {
    const store = operation.store;
    const entity = operation.current;
    if (store !== undefined && entity !== undefined) {
      store.state.update(entity, {selected: true}, true);
    }
  }

  /**
   * that returns no message, emit the complete event.
   * Either way, always update the submitted state.
   * @param message Message or undefined
   */
  private onCommit(message?: Message) {
    this.message$.next(message);
    if (message === undefined) {
      this.complete.emit();
    }
  }

}
