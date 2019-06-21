import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';

import { ClientRef } from 'src/lib/client';

@Component({
  selector: 'fadq-client-list-tool-item',
  templateUrl: './client-list-tool-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientListToolItemComponent {

  @Input() client: ClientRef;

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
    client: ClientRef;
  }>();

  /**
   * @ignore
   */
  @HostBinding('class.fadq-client-list-tool-item-added')
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
    this.added = false;
    this.addedChange.emit({added: false, client: this.client});
  }

  private doAdd() {
    this.added = true;
    this.addedChange.emit({added: true, client: this.client});
  }
}
