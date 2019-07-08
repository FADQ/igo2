import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { IgoMap } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';

@Component({
  selector: 'fadq-client-info-addresses',
  templateUrl: './client-info-addresses.component.html',
  styleUrls: ['./client-info-addresses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientInfoAddressesComponent {

  @Input() client: Client;

  @Input() map: IgoMap;

  @Output() clickAddress = new EventEmitter<string>();

}
