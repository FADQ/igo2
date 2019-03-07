import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, startWith} from 'rxjs/operators';

import {
  EntityStore,
  EntityStoreController,
  EntityRecord
} from '@igo2/common';

import { Mun, MunResponseItem } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import {CadastreMunService} from 'src/lib/cadastre/mun/shared/mun.service';

@Component({
  selector: 'fadq-cadastre-mun-selector',
  templateUrl: './cadastre-mun-selector.component.html',
  styleUrls: ['./cadastre-mun-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MunSelectorComponent implements OnInit, OnDestroy {

  /**
   * The current municipality
   * @internal
   */
  public current$ = new BehaviorSubject<Mun>(undefined);

  /**
   *Form control used to autocomplete the list box of municipalities
   */
  public munControl = new FormControl();

    /**
   *An observable on all municipalities
   */
  public filteredMun$: Observable<MunResponseItem[]>;

  /**
   * Controller of a municipality
   * @internal
   */
  private controller: EntityStoreController<Mun>;

  /**
   * Subscription to the selected municipality
   * @internal
   */
  private selectedMun$$: Subscription;

  /**
   * Store that holds all the available Municipalities
   */
  @Input() store: EntityStore<Mun>;

  /**
   * Event emmit on a selected municipality
   */
  @Output() selectedChange = new EventEmitter<{
    selected: boolean;
    mun: Mun;
  }>();

  constructor( private munService: CadastreMunService, private cdRef: ChangeDetectorRef) {}

  /**
   * Initialisation of the component
   */
  ngOnInit() {
    this.controller = new EntityStoreController(this.store, this.cdRef);

    // Load Municipalities
    this.loadMuns();

    // Keep the selected Municipality in a subscription
    this.selectedMun$$ = this.store.stateView
      .firstBy$((record: EntityRecord<Mun>) => record.state.selected === true)
      .subscribe((record: EntityRecord<Mun>) => {
        const mun = record ? record.entity : undefined;
        this.current$.next(mun);
      });

      // Initialise the filtered municipalities observable
      this.initFileredMun();
  }

  /**
   * Destroy the listeners
   */
  ngOnDestroy() {
    this.controller.destroy();
    this.selectedMun$$.unsubscribe();
  }

  /**
   * Return the municipality name
   * @param mun
   */
  getNomMun(mun: Mun): string {
    return  mun.nomMunicipalite;
  }

  /**
   * Return an event on the municipality selection
   * @param event
   */
  onSelectionChange(event: {value: Mun | undefined}) {
    const mun = event.value;
    if (mun === undefined) {
      this.store.state.updateAll({selected: false});
    } else {
      this.store.state.update(mun, {selected: true}, true);
    }
    this.selectedChange.emit({selected: true, mun});
  }

  private loadMuns() {

    if (!this.store.empty) { return; }

    this.munService.getMuns()
    .subscribe((mun: Mun[]) => {

      this.store.load(mun);

      this.store.view.sort({
        valueAccessor: (munSort: Mun) => munSort.nomMunicipalite,
        direction: 'asc'
      });
    });
  }

  private initFileredMun() {

    this.filteredMun$ = this.munControl.valueChanges
      .pipe(
        startWith<string | MunResponseItem | undefined>(undefined),
        map(value => {
          if (value === undefined) { return ''; }
          return typeof value === 'string' ? value : value.nomMunicipalite;
        }),
        map(munNom => munNom ? this.filterMunByName(munNom) : this.store.all())
      );
  }

  private filterMunByName(name: string): MunResponseItem[] {
    const filterValue = name.toLowerCase();
    return this.store.all().filter(mun => {
      return mun.nomMunicipalite.toLowerCase().indexOf(filterValue) === 0;
    });
  }
}
