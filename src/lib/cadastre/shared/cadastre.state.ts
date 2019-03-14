import { Injectable, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EntityStore } from '@igo2/common';
import { Mun } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import { Cadastre, CadastreFeature } from '../cadastre/shared/cadastre.interfaces';
import { VectorLayer, FeatureStore} from '@igo2/geo';
import * as olstyle from 'ol/style';
import { MapState } from '@igo2/integration';
import { crateLayerCadastre } from './cadastre.utils';


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
   * Store that holds all the selected Cadastre with Feature
   * @readonly
   * @return FeatureStore<Cadastre>
   */
  get cadastreFeatureStore(): FeatureStore<CadastreFeature> { return this._cadastreFeatureStore; }
  private _cadastreFeatureStore: FeatureStore<CadastreFeature>;

  constructor(private _mapState: MapState) {
    this.initMun();
    this.initCadastres();
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
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  initCadastreLayer() {

    if (this._layerCadastre === undefined || this._layerCadastre === null) {
      this._layerCadastre = crateLayerCadastre();
      this._mapState.map.addLayer(this._layerCadastre, false );
    }
  }
}
