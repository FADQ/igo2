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
  EntityRecord,
  EntityStore,
  EntityStoreController
} from 'src/lib/entity';

import { MunNom } from './mun.interfaces';
import {MunService} from './mun.service';
import {ClientParcelYear} from '../../../../lib/client/parcel/shared';
import {CatalogItem} from '../../../../lib/catalog/shared';

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

  private selected$$: Subscription;

  private controller: EntityStoreController<MunNom>;

  @Input() store: EntityStore<MunNom>;

  @Output() eventClick = new EventEmitter<any>();

  @Output() selectedChange = new EventEmitter<{
    selected: boolean;
    mun: MunNom;
  }>();

  constructor( private munService: MunService, private cdRef: ChangeDetectorRef) {
    this.store = new EntityStore<MunNom>([]);
  }

  ngOnInit() {
    this.controller = new EntityStoreController(this.store, this.cdRef);
    this.munService.getMun()
      .subscribe((mun: MunNom[]) => {
        const current = mun.find((munNom: MunNom) => {
          return munNom.current === true;
        });

        // this.store = new EntityStore<MunNom>(mun);
        this.store.load(mun);

        this.store.view.sort({
          valueAccessor: (munSort: MunNom) => munSort.nomMunicipalite,
          direction: 'asc'
        });

        if (current !== undefined) {
          this.store.state.update(current, {selected: true});
        }
      });
  }

  ngOnDestroy() {
    this.controller.destroy();
    // this.selected$$.unsubscribe();
  }

  getNomMun(mun: MunNom): string {
    return '' + mun.nomMunicipalite;
  }

  onSelectionChange(event: {value: MunNom | undefined}) {
    const mun = event.value;
    if (mun === undefined) {
      this.store.state.updateAll({selected: false});
    } else {
      this.store.state.update(mun, {selected: true}, true);
    }
    this.current$.next(mun ? mun : undefined);
    alert('test current$:' + this.current$.getValue().nomMunicipalite);
    this.selectedChange.emit({selected: true, mun});
  }

  onClickButton(event) {
    if (this.current$.getValue() === undefined || typeof this.current$ !== 'object' ) {
      alert('test current$:' + 'indéfini');
    } else {
      alert('test current$:' + this.current$.getValue().nomMunicipalite);
    }

    this.eventClick.emit(event);
  }

}
