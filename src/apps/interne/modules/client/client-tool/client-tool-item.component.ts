import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import {
  Client,
  ClientController,
  ClientInfoService,
} from 'src/lib/client';

@Component({
  selector: 'fadq-client-tool-item',
  templateUrl: './client-tool-item.component.html',
  styleUrls: ['./client-tool-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientToolItemComponent {

  readonly showContent$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  /**
   * Client controller
   */
  @Input() controller: ClientController;

  /**
   * Whetherthe legend should be shown
   */
  @Input() showLegend: boolean = false;

  /**
   * Whether additional info should be shown (adresses)
   */
  @Input() showInfo: boolean = true;

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

  /**
   * Event emitted when the client is cleared
   */
  @Output() clear = new EventEmitter<ClientController>();

  /**
   * Event emitted when the client is selected
   */
  @Output() select = new EventEmitter<ClientController>();

  /**
   * Event emitted when an address is clicked
   */
  @Output() clickAddress = new EventEmitter<string>();

  /**
   * @ignore
   */
  @HostBinding('class.fadq-client-tool-item-selected')
  get withSelectedClass() { return this.selected; }

  constructor(
    private clientInfoService: ClientInfoService
  ) {}

  /**
   * On clear, emit the clear event but do nothing else
   */
  onClear() {
    this.clear.emit(this.controller);
  }

  /**
   * On select, emit the clear select event and update the selected flag
   */
  onSelect() {
    this.selected = true;
    this.select.emit(this.controller);
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

  /**
   * Collapse or uncollapse the client info
   * @internal
   */
  toggleContent(collapsed: boolean) {
    this.showContent$.next(!collapsed);
  }

  /**
   * Return the colored thumbnail's inner color
   * @internal
   * @returns The inner color
   */
  getParcelInnerColor(): string {
    const baseColor = this.controller.parcelColor;
    return `rgba(${baseColor.join(',')}, 0.15)`;
  }

  /**
   * Return the colored thumbnail's outer color
   * @internal
   * @returns The inner color
   */
  getParcelOuterColor(): string {
    const baseColor = this.controller.parcelColor;
    return `rgb(${baseColor.join(',')})`;
  }
}
