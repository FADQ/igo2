import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ToolComponent, EntityStore } from '@igo2/common';
import { FEATURE } from '@igo2/geo';
import { SearchState } from '@igo2/integration';

import { ClientParcelYear } from 'src/lib/client';
import { ClientController } from '../shared/client-controller';
import { ClientState } from '../client.state';

/**
 * Tool to display a client's info
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
   * Observable of the client error, if any
   * @internal
   */
  get controller$(): BehaviorSubject<ClientController> { return this.clientState.controller$; }

  /**
   * Store holding all the avaiables "parcel years"
   * @internal
   */
  get parcelYears(): EntityStore<ClientParcelYear> {
    return this.clientState.parcelYears;
  }

  constructor(
    private clientState: ClientState,
    private searchState: SearchState
  ) {}

  /**
   * Locate the address with icherche
   * @internal
   */
  onClickAddress(address: string) {
    this.searchState.setSearchType(FEATURE);
    this.searchState.setSearchTerm(address);
  }

}
