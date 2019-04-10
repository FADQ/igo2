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

import { Cadastre, CadastreResponseItem } from 'src/lib/cadastre/cadastre/shared/cadastre.interfaces';
import {CadastreCadastreService} from 'src/lib/cadastre/cadastre/shared/cadastre.service';

@Component({
  selector: 'fadq-cadastre-cadastre-selector',
  templateUrl: './cadastre-cadastre-selector.component.html',
  styleUrls: ['./cadastre-cadastre-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CadastreSelectorComponent implements OnInit, OnDestroy {

  /**
   * The current municipality
   * @internal
   */
  @Input() current$ = new BehaviorSubject<Cadastre>(undefined);

  /**
   *Form control used to autocomplete the list box of municipalities
   */
  public cadastreControl = new FormControl();

    /**
   *An observable on all municipalities
   */
  public filteredMun$: Observable<CadastreResponseItem[]>;

  /**
   * Controller of a municipality
   * @internal
   */
  private controller: EntityStoreController<Cadastre>;

  /**
   * Subscription to the selected municipality
   * @internal
   */
  // private selectedMun$$: Subscription;

  /**
   * Store that holds all the available Municipalities
   */
  @Input() store: EntityStore<Cadastre>;

  /**
   * Event emmit on a selected municipality
   */
  @Output() selectedCadastreChange = new EventEmitter<{
    selected: boolean;
    cadastre: Cadastre;
  }>();

  constructor( private cadastreService: CadastreCadastreService, private cdRef: ChangeDetectorRef) {

  }

  /**
   * Initialisation of the component
   */
  ngOnInit() {
    this.controller = new EntityStoreController(this.store, this.cdRef);
  }

  /**
   * Destroy the listeners
   */
  ngOnDestroy() {
    this.controller.destroy();
  }

  /**
   * Return the municipality name
   * @param mun
   */
  getNomCadastre(cadastre: Cadastre): string {
    return  cadastre.nomCadastre;
  }

  /**
   * Return an event on the municipality selection
   * @param event
   */
  onSelectionChange(event: {value: Cadastre | undefined}) {
    const cadastre = event.value;
    if (cadastre === undefined) {
      this.store.state.updateAll({selected: false});
    } else {
      this.store.state.update(cadastre, {selected: true}, true);
    }
    this.selectedCadastreChange.emit({selected: true, cadastre});
  }
}
