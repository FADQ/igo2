import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { EntityTransaction, WidgetComponent } from '@igo2/common';

@Component({
  selector: 'fadq-edition-undo',
  templateUrl: './edition-undo.component.html',
  styleUrls: ['./edition-undo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditionUndoComponent implements WidgetComponent {

  /**
   * Optional title
   */
  @Input() title: string;

  /**
   * Transaction
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

  constructor() {}

  /**
   * Rollback the transaction
   * @internal
   */
  onSubmit() {
    this.transaction.rollback();
    this.complete.emit();
  }

  /**
   * Emit the cancel event
   * @internal
   */
  onCancel() {
    this.cancel.emit();
  }

}
