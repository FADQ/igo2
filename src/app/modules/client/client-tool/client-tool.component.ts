import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ToolComponent, EntityStore } from '@igo2/common';

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

  private controllers$$: Subscription;

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
    private clientState: ClientState
  ) {}

  ngOnInit() {
    this.controllers$$ = this.controllers.count$.subscribe((count: number) => {
      this.showLegend$.next(count === 1);
    });
  }

  ngOnDestroy() {
    this.controllers$$.unsubscribe();
  }

  onClearController(controller: ClientController) {
    this.clientState.clearController(controller);
  }

  onSelectController(controller: ClientController) {
    this.clientState.setActiveController(controller);
  }

}
