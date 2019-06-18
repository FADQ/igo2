import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith} from 'rxjs/operators';

import * as olproj from 'ol/proj';
import * as oleasing from 'ol/easing';

import { Poi } from '@igo2/context';
import { IgoMap } from '@igo2/geo';

/**
 * POI selector
 */
@Component({
  selector: 'fadq-poi-selector',
  templateUrl: './poi-selector.component.html',
  styleUrls: ['./poi-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoiSelectorComponent implements OnInit {

  /**
   * List of filtered pois
   * @internal
   */
  filteredPois$: Observable<Poi[]>;

  /**
   * Selected poi form control
   * @internal
   */
  poiControl = new FormControl();

  /**
   * Map
   */
  @Input() map: IgoMap;

  /**
   * List of all pois
   * @internal
   */
  @Input() pois: Poi[];

  constructor() {}

  /**
   * On init, setup an observable of filtered pois
   * @internal
   */
  ngOnInit() {
    this.filteredPois$ = this.poiControl.valueChanges
      .pipe(
        startWith<string | Poi | undefined>(undefined),
        map(value => {
          if (value === undefined) {
            return '';
          }
          return typeof value === 'string' ? value : value.title;
        }),
        map(title => title ? this.filterPoisByTitle(title) : this.pois.slice())
      );
  }

  /**
   * Zoom to the selected poi
   * @param poi POI
   * @internal
   */
  onPoiSelect(poi: Poi) {
    this.zoomToPoi(poi);
  }

  /**
   * Rezoom to the selected poi
   * @internal
   */
  onZoomButtonClick() {
    this.zoomToPoi(this.poiControl.value);
  }

  /**
   * Clear the selected poi form control
   * @internal
   */
  onClearButtonClick() {
    this.poiControl.setValue(undefined);
  }

  /**
   * Get a poi's title
   * @param poi POI
   * @returns Title
   * @internal
   */
  getPoiTitle(poi?: Poi) {
    return poi ? poi.title : undefined;
  }

  /**
   * Filter pois by title
   * @param title Title
   * @returns List of filtered pois
   */
  private filterPoisByTitle(title: string): Poi[] {
    const filterValue = title.toLowerCase();
    return this.pois.filter(poi => {
      return poi.title.toLowerCase().indexOf(filterValue) === 0;
    });
  }

  /**
   * Zoom to a poi
   * @param poi POI
   */
  private zoomToPoi(poi: Poi) {
    const center = olproj.fromLonLat(
      [Number(poi.x), Number(poi.y)],
      this.map.projection
    );

    this.map.ol.getView().animate({
      center: center,
      zoom: poi.zoom,
      duration: 500,
      easing: oleasing.easeOut
    });
  }

}
