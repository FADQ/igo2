import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Message } from '@igo2/core';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'fadq-card-panel-content',
  templateUrl: './card-panel-content.component.html',
  styleUrls: ['./card-panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardPanelContentComponent {

  /**
   * Message
   * @internal
   */
  @Input()
  set message(value: Message) { this.message$.next(value); }
  get message(): Message { return this.message$.value; }
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  constructor() {}

}
