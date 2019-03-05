import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy, NgModule
} from '@angular/core';

import {BehaviorSubject, Subject, Subscription} from 'rxjs';

import {
  EntityStore,
  EntityStoreController,
  EntityRecord
} from '@igo2/common';

import { MunNom } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import {MunService} from 'src/lib/cadastre/mun/shared/mun.service';


@Component({
  selector: 'fadq-mun-selector',
  templateUrl: './mun-selector.component.html',
  styleUrls: ['./mun-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MunSelectorComponent implements OnInit, OnDestroy {

  /**
   * The current municipality
   * @internal
   */
  public current$ = new BehaviorSubject<MunNom>(undefined);

  /**
   * Controller of a municipality
   * @internal
   */
  private controller: EntityStoreController<MunNom>;

  /**
   * Subscription to the selected municipality
   * @internal
   */
  private selectedMun$$: Subscription;

  /**
   * Store that holds all the available Municipalities
   */
  @Input() store: EntityStore<MunNom>;

  /**
   * Event emmit on a selected municipality
   */
  @Output() selectedChange = new EventEmitter<{
    selected: boolean;
    mun: MunNom;
  }>();

  constructor( private munService: MunService, private cdRef: ChangeDetectorRef) {

  }

  /**
   * Initialisation of the component
   */
  ngOnInit() {
    this.controller = new EntityStoreController(this.store, this.cdRef);
    if (this.store.empty) {
      this.munService.getMun()
      .subscribe((mun: MunNom[]) => {

        this.store.load(mun);

        this.store.view.sort({
          valueAccessor: (munSort: MunNom) => munSort.nomMunicipalite,
          direction: 'asc'
        });
      });
    }

    // Keep the selected Municipality in a subscription
    this.selectedMun$$ = this.store.stateView
      .firstBy$((record: EntityRecord<MunNom>) => record.state.selected === true)
      .subscribe((record: EntityRecord<MunNom>) => {
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
  getNomMun(mun: MunNom): string {
    return  mun.nomMunicipalite;
  }

  /**
   * Return an event on the municipality selection
   * @param event
   */
  onSelectionChange(event: {value: MunNom | undefined}) {
    const mun = event.value;
    if (mun === undefined) {
      this.store.state.updateAll({selected: false});
    } else {
      this.store.state.update(mun, {selected: true}, true);
    }
    this.current$.next(mun ? mun : undefined);
    this.selectedChange.emit({selected: true, mun});
  }
}
