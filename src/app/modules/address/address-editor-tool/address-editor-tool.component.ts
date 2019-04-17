import { Component, ChangeDetectionStrategy, Input} from '@angular/core';
import { IgoMap, FeatureStore, ImageLayerOptions, VectorLayer, FeatureDataSource, FeatureStoreLoadingStrategy, FeatureStoreSelectionStrategy } from '@igo2/geo';
import { MapState } from '@igo2/integration';

import { ToolComponent, EntityRecord } from '@igo2/common';
import { Address, AddressFeature } from 'src/lib/address';
import { AddressState } from '../address.state';
import { BehaviorSubject, Subscription } from 'rxjs';

/**
 * Tool to edit addresses from Adresses Quebec.
 */
@ToolComponent({
  name: 'addressEditor',
  title: 'tools.addressEditor',
  icon: 'edit_location'
})
@Component({
  selector: 'fadq-address-editor-tool',
  templateUrl: './address-editor-tool.component.html',
  styleUrls: ['./address-editor-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressEditorToolComponent {

  @Input() layerIdBuildings: string;
  @Input() layerIdBuildingsCorrected: string;
  @Input() layerIdCadastre: string;
  @Input() layerIdMun: string;
  @Input() layerOptions: ImageLayerOptions[];
  /**
   * Store Address
   * @internal
   */
  get store(): FeatureStore<AddressFeature> { return this.adressState.adressStore; }

  /**
   * Map to edit on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }
  constructor(
    private mapState: MapState,
    private adressState: AddressState
  ) {}

}
