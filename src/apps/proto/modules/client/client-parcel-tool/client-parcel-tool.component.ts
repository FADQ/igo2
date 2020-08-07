import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';

import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ToolComponent } from '@igo2/common';

import { ClientController } from '../shared/client-controller';
import { ClientState } from '../client.state';

/**
 * Tool edit parcel productions
 */
@ToolComponent({
  name: 'clientParcel',
  title: 'tools.clientParcel',
  icon: 'sprout'
})
@Component({
  selector: 'fadq-client-parcel-tool',
  templateUrl: './client-parcel-tool.component.html',
  styleUrls: ['./client-parcel-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelToolComponent implements OnDestroy {

  readonly controllerInEdition$: Observable<ClientController> =
    combineLatest(
      this.clientState.parcelEditionIsActive$,
      this.controller$
    ).pipe(
      map((res: [boolean, ClientController]) => {
        return res[0] ? res[1] : undefined;
      })
    );

  get controller$(): BehaviorSubject<ClientController> {
    return this.clientState.controller$;
  }

  constructor(
    private clientState: ClientState
  ) {}

  onStartEdition() {
    this.clientState.startParcelEdition();
  }

  onCompleteEdition() {
    this.clientState.stopParcelEdition();
  }

  onConfirmSelection(confirmed: boolean) {
    this.clientState.confirmParcelSelection(confirmed);
  }

  ngOnDestroy() {
    this.clientState.stopParcelEdition();
  }
}
