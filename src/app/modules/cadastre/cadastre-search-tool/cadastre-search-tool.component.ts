import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ToolComponent, EntityStore } from '@igo2/common';
import { CadastreState } from '../../../../lib/cadastre/shared/cadastre.state';
import { Mun } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import { CadastreMunService } from 'src/lib/cadastre/mun/shared/mun.service';
import { Cadastre } from 'src/lib/cadastre/cadastre/shared/cadastre.interfaces';
import { CadastreCadastreService } from 'src/lib/cadastre/cadastre/shared/cadastre.service';


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
export class CadastreSearchToolComponent implements OnInit {

  /**
   * Store that holds all the available Municipalities
   * @return EntityStore<Mun>
   */
  get munStore(): EntityStore<Mun> {
    return this.cadastreState.munStore;
  }

  /**
   * Store that holds all the available Municipalities
   * @return EntityStore<Mun>
   */
  get cadastreStore(): EntityStore<Cadastre> {
    return this.cadastreState.cadastreStore;
  }

  constructor(
    private cadastreState: CadastreState,
    private munService: CadastreMunService,
    private cadastreService: CadastreCadastreService
     ) { }

  ngOnInit() {
    this.loadMuns();
  }

  private loadMuns() {

    if (!this.munStore.empty) { return; }

    this.munService.getMuns()
    .subscribe((mun: Mun[]) => {

      this.munStore.load(mun);

      this.munStore.view.sort({
        valueAccessor: (munSort: Mun) => munSort.nomMunicipalite,
        direction: 'asc'
      });
    });
  }

  private loadCadastres(codeGeographique: string) {

    if (!this.cadastreStore.empty) { return; }

    this.cadastreService.getCadastres(codeGeographique)
    .subscribe((cadastre: Cadastre[]) => {

      this.cadastreStore.load(cadastre);

      this.cadastreStore.view.sort({
        valueAccessor: (cadastreSort: Cadastre) => cadastreSort.nomCadastre,
        direction: 'asc'
      });
    });
  }

  onSelectionMunChange(event: {mun: Mun}) {
    const mun = event.mun;
    this.loadCadastres(mun.codeGeographique);
  }

}
