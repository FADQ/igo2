import { Injectable, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EntityStore } from '@igo2/common';
import { Mun } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import { Cadastre, CadastreFeature } from '../cadastre/shared/cadastre.interfaces';
import { VectorLayer, FeatureStore, ImageLayer} from '@igo2/geo';
import * as olstyle from 'ol/style';
import { MapState } from '@igo2/integration';
import { cratePolygonLayer, createMarkerLayer } from './cadastre.utils';
import { Concession, ConcessionUnique, ConcessionFeature } from '../concession/shared/concession.interfaces';
import { LotUnique, LotFeature } from '../lot/shared/lot.interfaces';


/**
 * Service that holds the state of the edition module
 */
@Injectable({
  providedIn: 'root'
})
export class CadastreState {

  /**
   *Keep the current selected cadastre
   *
   */
  get currentCadastre$(): BehaviorSubject<Cadastre> { return this._currentCadastre$; }
  private _currentCadastre$ = new BehaviorSubject<Cadastre>(undefined);

  /**
   *Keep the current selected Feature cadastre
   *
   */
  get currentCadastreFeature$(): BehaviorSubject<CadastreFeature> { return this._currentCadastreFeature$; }
  private _currentCadastreFeature$ = new BehaviorSubject<CadastreFeature>(undefined);

  /**
   *Keep the current selected concession
   *
   */
  get currentConcession$(): BehaviorSubject<ConcessionUnique> { return this._currentConcession$; }
  private _currentConcession$ = new BehaviorSubject<ConcessionUnique>(undefined);

  /**
   *Keep the current selected Feature list concession
   *
   */
  get currentConcessionFeatures$(): BehaviorSubject<ConcessionFeature[]> { return this._currentConcessionFeatures$; }
  private _currentConcessionFeatures$ = new BehaviorSubject<ConcessionFeature[]>(undefined);

  /**
   *Keep the current selected lot
   *
   */
  get currentLot$(): BehaviorSubject<LotUnique> { return this._currentLot$; }
  private _currentLot$ = new BehaviorSubject<LotUnique>(undefined);

  /**
   *Keep the current selected Feature list lot
   *
   */
  get currentLotFeatures$(): BehaviorSubject<LotFeature[]> { return this._currentLotFeatures$; }
  private _currentLotFeatures$ = new BehaviorSubject<LotFeature[]>(undefined);

  /**
   * State of map
   * @type MapState
   */
  get mapState(): MapState { return this._mapState; }

  /**
   * Layer for the cadastre feature
   *
   * @type VectorLayer
   */
  get layerCadastre(): VectorLayer { return this._layerCadastre; }
  private _layerCadastre: VectorLayer;

    /**
   * Layer for the concession feature
   *
   * @type VectorLayer
   */
  get layerConcession(): VectorLayer { return this._layerConcession; }
  private _layerConcession: VectorLayer;

    /**
   * Layer for the lot feature
   *
   * @type VectorLayer
   */
  get layerLot(): VectorLayer { return this._layerLot; }
  private _layerLot: VectorLayer;

   /**
   * Image Layer for the cadastre
   *
   * @type VectorLayer
   */
  set layerCadastreImage(value: ImageLayer) {
    this._layerCadastreImage = value;
  }
  get layerCadastreImage(): ImageLayer { return this._layerCadastreImage; }
  private _layerCadastreImage: ImageLayer;

  /**
   * Store that holds all the available Municipalities
   */
  get munStore(): EntityStore<Mun> { return this._munStore; }
  private _munStore: EntityStore<Mun>;

  /**
   * Store that holds all the available Cadastre
   * @readonly
   * @return EntityStore<Cadastre>
   */
  get cadastreStore(): EntityStore<Cadastre> { return this._cadastreStore; }
  private _cadastreStore: EntityStore<Cadastre>;

  /**
   * Store that holds all the available Concession
   * @readonly
   * @return EntityStore<Concession>
   */
  get concessionStore(): EntityStore<ConcessionUnique> { return this._concessionStore; }
  private _concessionStore: EntityStore<ConcessionUnique>;

  /**
   * Store that holds all the available Lot
   * @readonly
   * @return EntityStore<Lot>
   */
  get lotStore(): EntityStore<LotUnique> { return this._lotStore; }
  private _lotStore: EntityStore<LotUnique>;

  /**
   *Enabled  the search button
   */
  private _searchDisabled: boolean = true;
  get searchDisabled(): boolean { return this._searchDisabled; }
  set searchDisabled(value: boolean) { this._searchDisabled = value; }


  constructor(private _mapState: MapState) {
    this.initMun();
    this.initCadastres();
    this.initConcessions();
    this.initLots();
  }

  /**
   *Initialise a store of municipalities
   *
   */
  initMun() {
    this._munStore = new EntityStore<Mun>([], {
      getKey: (entity: Mun) => entity.codeGeographique
    });
  }

  /**
   *Initialise a store of cadastres
   *
   */
  initCadastres() {
    this._cadastreStore = new EntityStore<Cadastre>([], {
      getKey: (entity: Cadastre) => entity.idCadastreOriginaire
    });
  }

  /**
   *Initialise a store of concessions
   *
   */
  initConcessions() {
    this._concessionStore = new EntityStore<ConcessionUnique>([], {
      getKey: (entity: ConcessionUnique) => entity.idConcession
    });
  }

  /**
   *Initialise a store of lots
   *
   */
  initLots() {
    this._lotStore = new EntityStore<LotUnique>([], {
      getKey: (entity: LotUnique) => entity.idLot
    });
  }

    /**
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  initCadastreLayer() {

    if (this._layerCadastre === undefined || this._layerCadastre === null) {
      this._layerCadastre = cratePolygonLayer('rgba(255, 255, 255, 0.2)', '#6efc02', 4);
      this._mapState.map.addLayer(this._layerCadastre, false );
    }
  }

   /**
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  initConcessionLayer() {

    if (this._layerConcession === undefined || this._layerConcession === null) {
      this._layerConcession = createMarkerLayer('yellow');
      this._mapState.map.addLayer(this._layerConcession, false );
    }
  }

  /**
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  initLotLayer() {

    if (this._layerLot === undefined || this._layerLot === null) {
      this._layerLot = createMarkerLayer('blue');
      this._mapState.map.addLayer(this._layerLot, false );
    }
  }
}
