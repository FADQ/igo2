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

import { BehaviorSubject, Subject, Subscription } from 'rxjs';

import {
  EntityStore,
  EntityStoreController,
  EntityRecord
} from '@igo2/common';

import { Mun } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import {CadastreMunService} from 'src/lib/cadastre/mun/shared/mun.service';

@Component({
  selector: 'fadq-cadastre-mun-selector',
  templateUrl: './mun-selector.component.html',
  styleUrls: ['./mun-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MunSelectorComponent implements OnInit, OnDestroy {

  /**
   * The current municipality
   * @internal
   */
  public current$ = new BehaviorSubject<Mun>(undefined);

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
    if (this.store.empty) {
      this.munService.getMuns()
      .subscribe((mun: Mun[]) => {

        this.store.load(mun);

        this.store.view.sort({
          valueAccessor: (munSort: Mun) => munSort.nomMunicipalite,
          direction: 'asc'
        });
      });
    }
  }
}
