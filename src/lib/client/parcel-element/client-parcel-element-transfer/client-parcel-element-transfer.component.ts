import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { WidgetComponent } from '@igo2/common';
import { IgoMap, FeatureStore } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcel } from '../../parcel/shared/client-parcel.interfaces';
import { ClientParcelElement } from '../../parcel-element/shared/client-parcel-element.interfaces';

@Component({
  selector: 'fadq-client-parcel-element-transfer-form',
  templateUrl: './client-parcel-element-transfer.component.html',
  styleUrls: ['./client-parcel-element-transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementTransferComponent implements WidgetComponent {

  /**
   * Client
   */
  @Input() client: Client;

  /**
   * Map to draw elements on
   */
  @Input() map: IgoMap;

  /**
   * Parcel
   */
  @Input() parcel: ClientParcel;

  /**
   * Parcel element store
   */
  @Input() store: FeatureStore<ClientParcelElement>;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor() {}

  onTransfer() {
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

}
