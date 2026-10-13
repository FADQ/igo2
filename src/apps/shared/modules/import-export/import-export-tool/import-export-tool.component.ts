import { Component, ChangeDetectionStrategy } from '@angular/core';

import { IgoMap } from '@igo2/geo';
import { MapState } from '@igo2/integration';


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
