import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Client, ClientWorkspace, ClientInfoService } from 'src/lib/client';

@Component({
  selector: 'fadq-client-tool-item',
  templateUrl: './client-tool-item.component.html',
  styleUrls: ['./client-tool-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientToolItemComponent {

  readonly showContent$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  @Input() workspace: ClientWorkspace;

  /**
   * Whether a row is selected
   */
  @Input()
  set selected(value: boolean) {
    if (value === this._selected) { return; }
    this._selected = value;
  }
  get selected(): boolean { return this._selected; }
  private _selected = false;

  @Output() clear = new EventEmitter<ClientWorkspace>();

  @Output() select = new EventEmitter<ClientWorkspace>();

  /**
   * @ignore
   */
  @HostBinding('class.fadq-client-tool-item-selected')
  get withSelectedClass() { return this.selected; }

  constructor(
    private clientInfoService: ClientInfoService
  ) {}

  onClear() {
    this.clear.emit(this.workspace);
  }

  onSelect() {
    this.selected = true;
    this.select.emit(this.workspace);
  }

  /**
   * Open the client's info link into a new window
   * @internal
   * @param client Client
   */
  openClientInfoLink(client: Client) {
    const link = this.clientInfoService.getClientInfoLink(client.info.numero);
    window.open(link, 'Client', 'width=800, height=600');
    return false;
  }

  toggleContent(collapsed: boolean) {
    this.showContent$.next(!collapsed);
  }

  getLegendInnerColor(): string {
    return `rgba(${this.workspace.color.join(',')}, 0.15)`;
  }

  getLegendOuterColor(): string {
    return `rgb(${this.workspace.color.join(',')})`;
  }
}
