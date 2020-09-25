import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap } from '@igo2/geo';
import { MapState } from '@igo2/integration';

@ToolComponent({
  name: 'fadqImportExport',
  title: 'igo.integration.tools.importExport',
  icon: 'file-move'
})
@Component({
  selector: 'fadq-import-export-tool',
  templateUrl: './import-export-tool.component.html',
  styleUrls: ['./import-export-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportExportToolComponent {
  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }

  constructor(
    private mapState: MapState
  ) {}

}
