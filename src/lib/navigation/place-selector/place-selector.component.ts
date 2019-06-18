import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs';
import { map, startWith} from 'rxjs/operators';

import { Feature, FeatureMotion, Overlay } from '@igo2/geo';
import { Place, PlaceCategory, PlaceService } from '../shared';

/**
 * Category and place selector
 */
@Component({
  selector: 'fadq-place-selector',
  templateUrl: './place-selector.component.html',
  styleUrls: ['./place-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceSelectorComponent implements OnInit {

  /**
   * Selected category
   * @internal
   */
  selectedCategory: PlaceCategory;

  /**
   * List of all places
   * @internal
   */
  places: Place[] = [];

  /**
   * List of filtered places
   * @internal
   */
  filteredPlaces$: Observable<Place[]>;

  /**
   * Selected place form control
   * @internal
   */
  placeControl = new FormControl();

  /**
   * Overlay feature
   * @internal
   */
  overlayFeature: Feature;

  /**
   * Map overlay
   */
  @Input() overlay: Overlay;

  /**
   * Available categories
   */
  @Input() categories: PlaceCategory[];

  constructor(private placeService: PlaceService) {}

  /**
   * On init, setup an observable of filtered places
   * @internal
   */
  ngOnInit() {
    this.filteredPlaces$ = this.placeControl.valueChanges
      .pipe(
        startWith<string | Place | undefined>(undefined),
        map(value => {
          if (value === undefined) { return ''; }
          return typeof value === 'string' ? value : value.title;
        }),
        map(title => title ? this.filterPlacesByTitle(title) : this.places.slice())
      );
  }

  /**
   * Get the list of places associated with the selected category
   * @param category Category
   * @internal
   */
  onCategorySelect(category: PlaceCategory) {
    this.selectedCategory = category;
    this.placeService.getPlacesByCategory(category)
      .subscribe(places => {
        this.places = places;
        this.clearPlace();
      });
  }

  /**
   * Get the geometry of the selected place and add it to the overlay
   * @param place Place
   * @internal
   */
  onPlaceSelect(place: Place) {
    this.placeService.getPlaceFeatureByCategory(this.selectedCategory, place)
      .subscribe((feature: Feature) => this.setOverlayFeature(feature));
  }

  /**
   * Rezoom the the overlay feature
   * @internal
   */
  onOverlayButtonClick() {
    this.setOverlayFeature(this.overlayFeature);
  }

  /**
   * Clear the selected place
   * @internal
   */
  onClearButtonClick() {
    this.clearPlace();
  }

  /**
   * Get a place's title
   * @param place Place
   * @returns Title
   * @internal
   */
  getPlaceTitle(place?: Place) {
    return place ? place.title : undefined;
  }

  /**
   * Clear the overlay and the select control
   * @internal
   */
  private clearPlace() {
    this.clearFeature();
    this.placeControl.setValue(undefined);
  }

  /**
   * Clear the overlay
   * @internal
   */
  private clearFeature() {
    this.setOverlayFeature(undefined);
  }

  /**
   * Clear the overlay or add a feature to it
   * @param feature Feature or undefined
   */
  private setOverlayFeature(feature?: Feature) {
    if (feature === undefined) {
      this.overlay.clear();
    } else {
      this.overlay.setFeatures([feature], FeatureMotion.Zoom);
    }
    this.overlayFeature = feature;
  }

  /**
   * Filter places by title
   * @param title Title
   * @returns List of filtered places
   */
  private filterPlacesByTitle(title: string): Place[] {
    const filterValue = title.toLowerCase();
    return this.places.filter(place => {
      return place.title.toLowerCase().indexOf(filterValue) === 0;
    });
  }

}
