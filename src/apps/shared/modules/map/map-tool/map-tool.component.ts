import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ConfigService } from '@igo2/core';
import { Layer, ImageLayer,  WMSDataSource, IgoMap } from '@igo2/geo';
import { MapState } from '@igo2/integration';

import { LayerInfoDialogComponent } from './layer-info-dialog.component';

/**
 * Tool to browse a map's layers or to choose a different map
 */
@Component({
  selector: 'fadq-map-tool',
  templateUrl: './map-tool.component.html',
  styleUrls: ['./map-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapToolComponent {

  constructor(
    private configService: ConfigService,
    private dialog: MatDialog,
    private mapState: MapState
  ) {}

  get map(): IgoMap {
    return this.mapState.map;
  }

  showInfoButton(layer: Layer): boolean {
    return layer.dataSource instanceof WMSDataSource;
  }

  onInfoButtonClick(layer: Layer) {
    const data = {
      layer: layer as ImageLayer,
      baseUrl: this.configService.getConfig('layer.infoLink')
    };
    this.dialog.open(LayerInfoDialogComponent, {data});
  }
}
