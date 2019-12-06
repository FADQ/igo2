import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';

import { Message } from '@igo2/core';
import { ToolComponent, EntityStore } from '@igo2/common';
import { FEATURE } from '@igo2/geo';
import { SearchState } from '@igo2/integration';

import {
  ClientController,
  ClientParcelYear,
  ClientInfoService
} from 'src/lib/client';

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
export class ClientToolComponent implements OnInit, OnDestroy {

  readonly showLegend$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  readonly parcelYearSelectorDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private controllers$$: Subscription;

  private parcelElements$$: Subscription;

  @Input() showInfo: boolean = true;

  /**
   * Observable of the active client
   * @internal
   */
  get controllers(): EntityStore<ClientController> { return this.clientState.controllers; }

  /**
   * Observable of the client error, if any
   * @internal
   */
  get activeController$(): BehaviorSubject<ClientController> { return this.clientState.activeController$; }

  /**
   * Observable of the client error, if any
   * @internal
   */
  get message$(): BehaviorSubject<Message> { return this.clientState.message$; }

  /**
   * Store holding all the avaiables "parcel years"
   * @internal
   */
  get parcelYearStore(): EntityStore<ClientParcelYear> {
    return this.clientState.parcelYearStore;
  }

  constructor(
    private clientInfoService: ClientInfoService,
    private clientState: ClientState,
    private searchState: SearchState
  ) {}

  ngOnInit() {
    this.controllers$$ = this.controllers.count$.subscribe((count: number) => {
      this.showLegend$.next(count === 1);
      this.watchParcelElements();
    });
  }

  ngOnDestroy() {
    this.controllers$$.unsubscribe();
    this.unwatchParcelElements();
  }

  onDestroyController(controller: ClientController) {
    this.clientState.destroyController(controller);
  }

  onSelectController(controller: ClientController) {
    this.clientState.setActiveController(controller);
  }

  onClickAddress(address: string) {
    this.searchState.setSearchType(FEATURE);
    this.searchState.setSearchTerm(address);
  }

  private watchParcelElements() {
    this.unwatchParcelElements();
    const parcelElementsActives$ = this.controllers.all().map((controller: ClientController) => {
      return controller.parcelElementsActive$;
    });

    this.parcelElements$$ = combineLatest(...parcelElementsActives$).subscribe((bunch: boolean[]) => {
      const nosActive = bunch.every((active: boolean) => active === false);
      this.parcelYearSelectorDisabled$.next(!nosActive);
    });
  }

  private unwatchParcelElements() {
    if (this.parcelElements$$ !== undefined) {
      this.parcelElements$$.unsubscribe();
      this.parcelElements$$ = undefined;
    }
  }

}
