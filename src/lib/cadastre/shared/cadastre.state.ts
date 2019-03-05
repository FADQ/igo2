import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { EntityRecord, EntityStore } from '@igo2/common';
import { MunNom } from 'src/lib/cadastre/mun/shared/mun.interfaces';

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
  get munStore(): EntityStore<MunNom> { return this._munStore; }
  private _munStore: EntityStore<MunNom>;

  constructor() {
    this._munStore = new EntityStore<MunNom>([]);
  }
}
