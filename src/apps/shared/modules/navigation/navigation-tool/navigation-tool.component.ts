import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Poi } from '@igo2/context';
import { IgoMap } from '@igo2/geo';
import { MapState } from '@igo2/integration';

import { PlaceCategory } from 'src/lib/navigation';

@Component({
  selector: 'fadq-navigation-tool',
  templateUrl: './navigation-tool.component.html',
  styleUrls: ['./navigation-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationToolComponent {

  @Input() categories: PlaceCategory[] = [];

  @Input() pois: Poi[] = [];

  /**
   * Map to navigate on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }

  constructor(private mapState: MapState) {}
}
