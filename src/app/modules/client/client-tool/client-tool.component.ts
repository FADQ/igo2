import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';

import { ToolComponent, EntityStore } from '@igo2/common';
import { FEATURE } from '@igo2/geo';
import { SearchState } from '@igo2/integration';

import {
  CLIENT,
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

  @Input() showInfo: boolean = true;

  private controllers$$: Subscription;

  private parcelElementTx$$: Subscription;

  /**
   * Observable of the active client
   * @internal
   */
  get controllers(): EntityStore<ClientController> { return this.clientState.controllerStore; }

  /**
   * Observable of the client error, if any
   * @internal
   */
  get activeController$(): BehaviorSubject<ClientController> { return this.clientState.activeController$; }

  /**
   * Observable of the client error, if any
   * @internal
   */
  get message$(): BehaviorSubject<string> { return this.clientState.message$; }

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
      this.watchParcelElementTx();
    });
  }

  ngOnDestroy() {
    this.controllers$$.unsubscribe();
    this.unwatchParcelElementTx();
  }

  onClearController(controller: ClientController) {
    this.clientState.clearController(controller);
  }

  onSelectController(controller: ClientController) {
    this.clientState.setActiveController(controller);
  }

  onClickAddress(address: string) {
    this.searchState.setSearchType(FEATURE);
    this.searchState.setSearchTerm(address);
  }

  private watchParcelElementTx() {
    this.unwatchParcelElementTx();
    const parcelElementTxActives$ = this.controllers.all().map((controller: ClientController) => {
      return controller.parcelElementTxActive$;
    });

    this.parcelElementTx$$ = combineLatest(...parcelElementTxActives$).subscribe((bunch: boolean[]) => {
      const noTxActive = bunch.every((active: boolean) => active === false);
      this.parcelYearSelectorDisabled$.next(!noTxActive);
    });
  }

  private unwatchParcelElementTx() {
    if (this.parcelElementTx$$ !== undefined) {
      this.parcelElementTx$$.unsubscribe();
      this.parcelElementTx$$ = undefined;
    }
  }

}
