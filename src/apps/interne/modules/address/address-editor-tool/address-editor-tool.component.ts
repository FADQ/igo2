import { Component, ChangeDetectionStrategy, Input} from '@angular/core';

import { IgoMap, FeatureStore, ImageLayerOptions } from '@igo2/geo';
import { MapState } from '@igo2/integration';

import { AddressFeature } from 'src/lib/address';

import { AddressState } from '../address.state';

/**
 * Tool to edit addresses from Adresses Quebec.
 */
@Component({
  selector: 'fadq-address-editor-tool',
  templateUrl: './address-editor-tool.component.html',
  styleUrls: ['./address-editor-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressEditorToolComponent {

  @Input() layerAliasBuildings: string;
  @Input() layerAliasBuildingsCorrected: string;
  @Input() layerAliasCadastre: string;
  @Input() layerAliasMun: string;
  @Input() layerOptions: ImageLayerOptions[];
  /**
   * Store Address
   * @internal
   */
  get store(): FeatureStore<AddressFeature> { return this.addressState.adressStore; }

  /**
   * Map to edit on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }

  constructor(
    private mapState: MapState,
    private addressState: AddressState
  ) {}

}
