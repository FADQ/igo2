import { Injectable, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EntityStore } from '@igo2/common';
import { Mun } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import { Cadastre, CadastreFeature } from '../cadastre/shared/cadastre.interfaces';
import { VectorLayer, FeatureStore} from '@igo2/geo';
import * as olstyle from 'ol/style';
import { MapState } from '@igo2/integration';
import { crateLayerCadastre, crateLayerConcession } from './cadastre.utils';
import { Concession, ConcessionUnique } from '../concession/shared/concession.interfaces';


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
   *Keep the current selected concession
   *
   */
  get currentConcession$(): BehaviorSubject<ConcessionUnique> { return this._currentConcession$; }
  private _currentConcession$ = new BehaviorSubject<ConcessionUnique>(undefined);

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


  constructor(private _mapState: MapState) {
    this.initMun();
    this.initCadastres();
    this.initConcessions();
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
      getKey: (entity: ConcessionUnique) => entity.nomConcession
    });
  }

    /**
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  initCadastreLayer() {

    if (this._layerCadastre === undefined || this._layerCadastre === null) {
      this._layerCadastre = crateLayerCadastre();
      this._mapState.map.addLayer(this._layerCadastre, false );
    }
  }

   /**
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  initConcessionLayer() {

    if (this._layerConcession === undefined || this._layerConcession === null) {
      this._layerConcession = crateLayerConcession();
      this._mapState.map.addLayer(this._layerConcession, false );
    }
  }
}
