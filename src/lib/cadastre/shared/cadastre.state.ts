import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { EntityRecord, EntityStore } from '@igo2/common';
import { Mun } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import { Cadastre } from '../cadastre/shared/cadastre.interfaces';
import { FeatureStore } from '@igo2/geo';

/**
 * Service that holds the state of the edition module
 */
@Injectable({
  providedIn: 'root'
})
export class CadastreState {

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

  constructor() {
    this.initMun();
    this.initCadastre();
  }

  initMun() {
    this._munStore = new EntityStore<Mun>([], {
      getKey: (entity: Mun) => entity.codeGeographique
    });
  }

  initCadastre() {
    this._cadastreStore = new EntityStore<Cadastre>([], {
      getKey: (entity: Cadastre) => entity.idCadastreOriginaire
    });
  }
}
