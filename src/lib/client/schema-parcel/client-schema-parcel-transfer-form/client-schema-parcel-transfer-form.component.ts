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
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElement } from '../../schema-element/shared/client-schema-element.interfaces';

@Component({
  selector: 'fadq-client-schema-parcel-transfer-form',
  templateUrl: './client-schema-parcel-transfer-form.component.html',
  styleUrls: ['./client-schema-parcel-transfer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaParcelTransferFormComponent implements WidgetComponent {

  /**
   * Client
   */
  @Input() client: Client;

  /**
   * Map to draw elements on
   */
  @Input() map: IgoMap;

  /**
   * Schema
   */
  @Input() schema: ClientSchema;

  /**
   * Schema element store
   */
  @Input() store: FeatureStore<ClientSchemaElement>;

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
