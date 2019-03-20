import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ToolComponent, EntityStore } from '@igo2/common';
import { CadastreState } from '../../../../lib/cadastre/shared/cadastre.state';
import { Mun } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import { CadastreMunService } from 'src/lib/cadastre/mun/shared/mun.service';
import { Cadastre, CadastreFeature } from 'src/lib/cadastre/cadastre/shared/cadastre.interfaces';
import { CadastreCadastreService } from 'src/lib/cadastre/cadastre/shared/cadastre.service';
import { BehaviorSubject } from 'rxjs';
import { VectorLayer, featureToOl, Feature, moveToFeatures } from '@igo2/geo';
import { Concession, ConcessionFeature, ConcessionUnique } from 'src/lib/cadastre/concession/shared/concession.interfaces';
import { CadastreConcessionService } from 'src/lib/cadastre/concession/shared/concession.service';

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
   *
   *Cadastre layer
   */
  private cadastreLayer: VectorLayer;

    /**
   *
   *Concession layer
   */
  private concessionLayer: VectorLayer;

  /**
   * Store that holds all the available Municipalities
   * @return EntityStore<Mun>
   */
  get munStore(): EntityStore<Mun> {
    return this.cadastreState.munStore;
  }

  /**
   * Store that holds all the available Cadastre
   * @return EntityStore<Cadastre>
   */
  get cadastreStore(): EntityStore<Cadastre> {
    return this.cadastreState.cadastreStore;
  }

  /**
   * Store that holds all the available Concession
   * @return EntityStore<Mun>
   */
  get concessionStore(): EntityStore<ConcessionUnique> {
    return this.cadastreState.concessionStore;
  }

  /**
   * Keep the current selected cadastre
   * @internal
   */
  get currentCadastre$(): BehaviorSubject<Cadastre> { return this.cadastreState.currentCadastre$; }

   /**
   * Keep the current selected concession
   * @internal
   */
  get currentConcession$(): BehaviorSubject<ConcessionUnique> { return this.cadastreState.currentConcession$; }

  constructor(
    private cadastreState: CadastreState,
    private munService: CadastreMunService,
    private cadastreService: CadastreCadastreService,
    private concessionService: CadastreConcessionService
     ) { }

  ngOnInit() {
    this.loadMuns();
  }

  /**
   *Load the list of municipalities
   *
   */
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

  /**
   *Load the of cadastre related to a municipality
   *
   * @param string codeGeographique
   */
  private loadCadastres(codeGeographique: string) {

    if (!this.cadastreStore.empty) { this.cadastreStore.clear(); }

    this.cadastreService.getCadastres(codeGeographique)
    .subscribe((cadastre: Cadastre[]) => {

      this.cadastreStore.load(cadastre);

      this.cadastreStore.view.sort({
        valueAccessor: (cadastreSort: Cadastre) => cadastreSort.codeCadastre,
        direction: 'asc'
      });
    });
  }

  /**
   *Load the of concession related to a cadastre
   *
   * @param string codeGeographique
   */
  private loadConcessions(idCadastreOriginaire: number) {

    if (!this.concessionStore.empty) { this.concessionStore.clear(); }

    this.concessionService.getConcessions(idCadastreOriginaire)
    .subscribe((concessions: ConcessionUnique[]) => {

      this.concessionStore.load(concessions);

      this.concessionStore.view.sort({
        valueAccessor: (concessionSort: ConcessionUnique) => concessionSort.nomConcession,
        direction: 'asc'
      });
    });
  }

  /**
   * Reaction on a selected municipality
   *
   * @param {{mun: Mun}} event
   */
  onSelectionMunChange(event: {mun: Mun}) {
    const mun = event.mun;
    this.loadCadastres(mun.codeGeographique);
  }

  /**
   * Reaction on a selected cadastre
   */
  onSelectionCadastreChange(event: {cadastre: Cadastre}) {
    const cadastre = event.cadastre;

    this.cadastreService.getCadastreFeatureByNum(cadastre.idCadastreOriginaire)
    .subscribe((cadastreList: CadastreFeature) => {

      this.cadastreState.initCadastreLayer();
      this.cadastreLayer = this.cadastreState.layerCadastre;
      this.showUnCadastre(cadastreList);
    });

    this.cadastreState.currentCadastre$.next(cadastre);

    this.loadConcessions(cadastre.idCadastreOriginaire);
  }

    /**
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  showUnCadastre(cadastre: CadastreFeature) {

    // Feature conversion to OL Feature
    const feature = featureToOl(cadastre as Feature, this.cadastreState.mapState.map.projection);

    this.cadastreLayer.dataSource.ol.clear();

    this.cadastreLayer.dataSource.ol.addFeatures([feature]);
    moveToFeatures(this.cadastreState.mapState.map, [feature]);

  }

  /**
   * Reaction on a selected cadastre
   */
  onSelectionConcessionChange(event: {concession: ConcessionUnique}) {
    const concession = event.concession;

    this.concessionService.getConcessionFeatureByNum(concession.listeConcession)
    .subscribe((concessionList: ConcessionFeature[]) => {

      this.cadastreState.initConcessionLayer();
      this.concessionLayer = this.cadastreState.layerConcession;
      this.showConcessions(concessionList);
    });

    this.cadastreState.currentConcession$.next(concession);
  }

   /**
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  showConcessions(concessionList: ConcessionFeature[]) {

    // Clear the layer
    this.concessionLayer.dataSource.ol.clear();
    const listConcessionFeature: Feature[] = [];

    concessionList.map((concession: ConcessionFeature) => {
      // Feature conversion to OL Feature
      const feature = featureToOl(concession as Feature, this.cadastreState.mapState.map.projection);
      listConcessionFeature.push(feature);

    });

    this.concessionLayer.dataSource.ol.addFeatures(listConcessionFeature);

    moveToFeatures(this.cadastreState.mapState.map, listConcessionFeature);

  }
}
