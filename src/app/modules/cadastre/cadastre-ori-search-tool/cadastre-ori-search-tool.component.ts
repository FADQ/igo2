import {Component, ChangeDetectionStrategy} from '@angular/core';
import { ToolComponent, EntityStore } from '@igo2/common';
import { CadastreState } from '../../../../lib/cadastre/shared/cadastre.state';
import {MunNom} from 'src/lib/cadastre/mun/shared/mun.interfaces';

@ToolComponent({
  name: 'cadastreOri',
  title: 'tools.cadastreOri',
  icon: 'grid_on'
})
@Component({
  selector: 'fadq-cadastre-ori-search-tool',
  templateUrl: './cadastre-ori-search-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CadastreOriSearchToolComponent {

  /**
   * Store that holds all the available Municipalities
   */
  get munStore(): EntityStore<MunNom> {
    return this.cadastreState.munStore;
  }

  constructor( private cadastreState: CadastreState ) {}
}
