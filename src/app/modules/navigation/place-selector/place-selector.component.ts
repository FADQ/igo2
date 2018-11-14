import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith} from 'rxjs/operators';

import { Overlay } from '../../overlay/shared/overlay';
import { OverlayAction } from '../../overlay/shared/overlay.enum';
import { Feature } from '../../feature/shared/feature.interface';
import { Place, PlaceCategory } from '../shared/place.interface';
import { PlaceService } from '../shared/place.service';


@Component({
  selector: 'fadq-place-selector',
  templateUrl: './place-selector.component.html',
  styleUrls: ['./place-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceSelectorComponent implements OnInit {

  public selectedCategory: PlaceCategory;
  public places: Place[] = [];
  public filteredPlaces$: Observable<Place[]>;
  public placeControl = new FormControl();
  public overlayFeature: Feature;

  @Input()
  get overlay(): Overlay {
    return this._overlay;
  }
  set overlay(value: Overlay) {
    this._overlay = value;
  }
  private _overlay: Overlay;

  @Input()
  get categories(): PlaceCategory[] {
    return this._categories;
  }
  set categories(value: PlaceCategory[]) {
    this._categories = value;
  }
  private _categories: PlaceCategory[];

  constructor(
    private placeService: PlaceService
  ) {}

  ngOnInit() {
    this.filteredPlaces$ = this.placeControl.valueChanges
      .pipe(
        startWith<string | Place | undefined>(undefined),
        map(value => {
          if (value === undefined) {
            return '';
          }
          return typeof value === 'string' ? value : value.title;
        }),
        map(title => title ? this.filterPlacesByTitle(title) : this.places.slice())
      );
  }

  selectCategory(category: PlaceCategory) {
    this.selectedCategory = category;
    this.placeService.getPlacesByCategory(category)
      .subscribe(places => {
        this.places = places;
        this.clearPlace();
      });
  }

  selectPlace(place: Place) {
    this.placeService.getPlaceFeatureByCategoryAndId(this.selectedCategory, place.id)
      .subscribe((feature: Feature) => this.setOverlayFeature(feature));
  }

  setOverlayFeature(feature: Feature | undefined) {
    this.overlayFeature = feature;
    if (feature === undefined) {
      this.overlay.clear();
    } else {
      this.overlay.setFeatures([feature], OverlayAction.Zoom);
    }
  }

  clearPlace() {
    this.clearFeature();
    this.placeControl.setValue(undefined);
  }

  displayPlace(place?: Place) {
    return place ? place.title : undefined;
  }

  private clearFeature() {
    this.overlay.clear();
  }

  private filterPlacesByTitle(title: string): Place[] {
    const filterValue = title.toLowerCase();
    return this.places.filter(place => {
      return place.title.toLowerCase().indexOf(filterValue) === 0;
    });
  }
}
