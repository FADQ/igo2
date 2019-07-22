import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { Message } from '@igo2/core';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'fadq-card-panel',
  templateUrl: './card-panel.component.html',
  styleUrls: ['./card-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardPanelComponent {

  @Input() svgIcon: string;

  @Input() iconColor: string;

  @Input() title: string;

  /**
   * Message, if any
   * @internal
   */
  @Input()
  set message(value: Message) { this.message$.next(value); }
  get message(): Message { return this.message$.value; }
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  constructor() {}

}
