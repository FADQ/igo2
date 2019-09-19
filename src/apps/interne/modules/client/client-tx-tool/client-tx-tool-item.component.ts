import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';

import { Client } from 'src/lib/client';

@Component({
  selector: 'fadq-client-tx-tool-item',
  templateUrl: './client-tx-tool-item.component.html',
  styleUrls: ['./client-tx-tool-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientTxToolItemComponent {

  @Input() client: Client;

  /**
   * Whether a row is added
   */
  @Input()
  set added(value: boolean) {
    if (value === this._added) { return; }
    this._added = value;
  }
  get added(): boolean { return this._added; }
  private _added = false;

  /**
   * Event emitted when the add/remove button is clicked
   */
  @Output() addedChange = new EventEmitter<{
    added: boolean;
    client: Client;
  }>();

  /**
   * Event emitted when the add/remove button is clicked
   */
  @Output() delete = new EventEmitter<Client>();

  /**
   * @ignore
   */
  @HostBinding('class.fadq-client-tx-tool-item-added')
  get withAddedClass() { return this.added; }

  constructor() {}

  /**
   * On toggle button click, emit the added change event
   * @internal
   */
  onToggleClick() {
    this.added ? this.doRemove() : this.doAdd();
  }

  /**
   * On delete button click, emit the delete event
   * @internal
   */
  onDeleteClick() {
    this.delete.emit(this.client);
  }

  private doRemove() {
    this.addedChange.emit({added: false, client: this.client});
  }

  private doAdd() {
    this.addedChange.emit({added: true, client: this.client});
  }
}