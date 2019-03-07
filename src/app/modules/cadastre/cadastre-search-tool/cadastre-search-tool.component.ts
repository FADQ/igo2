import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ToolComponent, EntityStore } from '@igo2/common';
import { CadastreState } from '../../../../lib/cadastre/shared/cadastre.state';
import { Mun } from 'src/lib/cadastre/mun/shared/mun.interfaces';

@ToolComponent({
  name: 'cadastre',
  title: 'tools.cadastre',
  icon: 'grid_on'
})
@Component({
  selector: 'fadq-cadastre-search-tool',
  templateUrl: './cadastre-search-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CadastreSearchToolComponent {

  /**
   * Store that holds all the available Municipalities
   * @return EntityStore<Mun>
   */
  get munStore(): EntityStore<Mun> {
    return this.cadastreState.munStore;
  }

  constructor(private cadastreState: CadastreState) {}
}
