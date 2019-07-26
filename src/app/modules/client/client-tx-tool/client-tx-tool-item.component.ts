import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';

import { ClientInTx } from 'src/lib/client';

@Component({
  selector: 'fadq-client-tx-tool-item',
  templateUrl: './client-tx-tool-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientTxToolItemComponent {

  @Input() client: ClientInTx;

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
    client: ClientInTx;
  }>();

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

  private doRemove() {
    this.addedChange.emit({added: false, client: this.client});
  }

  private doAdd() {
    this.addedChange.emit({added: true, client: this.client});
  }
}
