import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Message } from '@igo2/core';
import { ToolComponent, EntityStore } from '@igo2/common';
import { FEATURE } from '@igo2/geo';
import { SearchState } from '@igo2/integration';

import {
  ClientController,
  ClientParcelYear
} from 'src/lib/client';

import { ClientState } from '../client.state';

/**
 * Tool to display a list of clients
 */
@ToolComponent({
  name: 'client',
  title: 'tools.client',
  icon: 'account'
})
@Component({
  selector: 'fadq-client-tool',
  templateUrl: './client-tool.component.html',
  styleUrls: ['./client-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientToolComponent {

  /**
   * Whether additional info should be shown (adresses)
   */
  @Input() showInfo: boolean = true;

  /**
   * Store containing all the client controllers
   * @internal
   */
  get controllers(): EntityStore<ClientController> { return this.clientState.controllers; }

  /**
   * Observable of the active controller
   * @internal
   */
  get activeController$(): BehaviorSubject<ClientController> { return this.clientState.activeController$; }

  /**
   * Observable of a message. This one is generally used to display
   * errors such as when a client is not found
   * @internal
   */
  get message$(): BehaviorSubject<Message> { return this.clientState.message$; }

  /**
   * Store holding all the availables "parcel years"
   * @internal
   */
  get parcelYearStore(): EntityStore<ClientParcelYear> {
    return this.clientState.parcelYearStore;
  }

  /**
   * Observable of the parcel year selector state
   * @internal
   */
  get parcelYearSelectorDisabled$(): BehaviorSubject<boolean> {
    return this.clientState.parcelElementTxOngoing$;
  }

  /**
   * Observable of the legend shown status
   * @internal
   */
  get showLegend$(): Observable<boolean> {
    if (this._showLegend$ === undefined) {
      this._showLegend$ = this.controllers.count$.pipe(
        map((count: number) => count === 1)
      );
    } 
    return this._showLegend$;
  }
  private _showLegend$: Observable<boolean>;

  constructor(
    private clientState: ClientState,
    private searchState: SearchState
  ) {}

  /**
   * Destroy client controller
   * @internal
   */
  onDestroyController(controller: ClientController) {
    this.clientState.destroyController(controller);
  }

  /**
   * Set active controller
   * @internal
   */
  onSelectController(controller: ClientController) {
    this.clientState.setActiveController(controller);
  }

  /**
   * Trigger a research of the clicked address
   * @internal
   */
  onClickAddress(address: string) {
    this.searchState.setSearchType(FEATURE);
    this.searchState.setSearchTerm(address);
  }

}
