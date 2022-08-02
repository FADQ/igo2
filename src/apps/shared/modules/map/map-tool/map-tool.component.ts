import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ConfigService } from '@igo2/core';
import { Layer, ImageLayer, WMSDataSource, IgoMap } from '@igo2/geo';
import { ContextState, MapState } from '@igo2/integration';

import { CustomContextService } from 'src/lib/context'

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
    private mapState: MapState,
    private contextState: ContextState,
    private customContextService: CustomContextService,
  ) {}

  get map(): IgoMap {
    return this.mapState.map;
  }

  get saveContextEnabled(): boolean {
    return this.configService.getConfig('customContext.saveEnabled')
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

  onSaveContextButtonClick() {
    if (!this.saveContextEnabled) {
      return;
    }

    const currentContext = this.contextState.context$.value;
    const context = this.customContextService.getContextFromMap(this.map);
    context.id = currentContext.id;
    context.title = currentContext.title;
    context.uri = currentContext.uri;
    context.tools = currentContext.tools;
    this.customContextService.saveContext(context).subscribe(() => {});
  }
}
