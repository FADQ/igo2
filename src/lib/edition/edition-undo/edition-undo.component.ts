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

  onSubmit() {
    this.transaction.rollback();
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

}
