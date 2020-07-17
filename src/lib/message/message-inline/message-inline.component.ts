import {
  Component,
  Input,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';

import { Message, MessageType } from '@igo2/core';

/**
 * Inline message
 */
@Component({
  selector: 'fadq-message-inline',
  templateUrl: './message-inline.component.html',
  styleUrls: ['./message-inline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageInlineComponent {

  /**
   * Reference to the message types
   * @internal
   */
  messageType = MessageType;

  /**
   * Message
   */
  @Input() message: Message;

  /**
   * Optionnal icon
   */
  @Input() icon: string;

  /**
   * Optionnal icon
   */
  @Input() iconColor: string = 'primary';

  /**
   * @ignore
   */
  @HostBinding(`class.fadq-message-inline`)
  get withMessageClass() { return true; }

}
