import { Component, OnInit, ChangeDetectionStrategy, Input, ElementRef } from '@angular/core';

import * as olProj from 'ol/proj';

import { ActionStore } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { FEATURE, IgoMap } from '@igo2/geo';
import { SearchState } from '@igo2/integration';


@Component({
  selector: 'fadq-contextual-menu',
  templateUrl: './contextual-menu.component.html',
  styleUrls: ['./contextual-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextualMenuComponent implements OnInit {

  readonly store = new ActionStore([]);

  @Input() location: {x: number, y: number};

  @Input() map: IgoMap;

  @Input() mapBrowser: ElementRef;

  constructor(
    private languageService: LanguageService,
    private searchState: SearchState
  ) {}

  ngOnInit() {
    this.store.load([
      {
        id: 'coordinates',
        title: this.languageService.translate.instant('coordinates'),
        handler: () => this.searchAtCoordinate()
      },
    ]);
  }

  private searchAtCoordinate() {
    const location = this.location;
    const coordinate = this.getClickCoordinate(location);
    const searchBarTerm = coordinate.map((c) => c.toFixed(6)).join(', ');
    this.searchState.setSearchType(FEATURE);
    this.searchState.setSearchTerm(searchBarTerm);
  }

  private getClickCoordinate(event: { x: number; y: number }) {
    const contextmenuPoint = event;
    const boundingMapBrowser = this.mapBrowser.nativeElement.getBoundingClientRect();
    contextmenuPoint.y =
      contextmenuPoint.y -
      boundingMapBrowser.top +
      (window.scrollY || window.pageYOffset);
    contextmenuPoint.x =
      contextmenuPoint.x -
      boundingMapBrowser.left +
      (window.scrollX || window.pageXOffset);
    const pixel = [contextmenuPoint.x, contextmenuPoint.y];

    const coord = this.map.ol.getCoordinateFromPixel(pixel);
    const proj = this.map.projection;
    return olProj.transform(coord, proj, 'EPSG:4326');
  }
}
