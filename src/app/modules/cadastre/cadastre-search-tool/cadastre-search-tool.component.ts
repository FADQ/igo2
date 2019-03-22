import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ToolComponent, EntityStore } from '@igo2/common';
import { CadastreState } from '../../../../lib/cadastre/shared/cadastre.state';
import { Mun } from 'src/lib/cadastre/mun/shared/mun.interfaces';
import { CadastreMunService } from 'src/lib/cadastre/mun/shared/mun.service';
import { Cadastre, CadastreFeature } from 'src/lib/cadastre/cadastre/shared/cadastre.interfaces';
import { CadastreCadastreService } from 'src/lib/cadastre/cadastre/shared/cadastre.service';
import { BehaviorSubject } from 'rxjs';
import { VectorLayer, featureToOl, Feature, moveToFeatures } from '@igo2/geo';
import { ConcessionFeature, ConcessionUnique } from 'src/lib/cadastre/concession/shared/concession.interfaces';
import { CadastreConcessionService } from 'src/lib/cadastre/concession/shared/concession.service';
import { LotUnique, LotFeature } from 'src/lib/cadastre/lot/shared/lot.interfaces';
import { CadastreLotService } from 'src/lib/cadastre/lot/shared/lot.service';


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
   *
   *Lot layer
   */
  private lotLayer: VectorLayer;

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
   * Store that holds all the available Lot
   * @return EntityStore<Mun>
   */
  get lotStore(): EntityStore<LotUnique> {
    return this.cadastreState.lotStore;
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

  /**
   * Keep the current selected lot
   * @internal
   */
  get currentLot$(): BehaviorSubject<LotUnique> { return this.cadastreState.currentLot$; }

  constructor(
    private cadastreState: CadastreState,
    private munService: CadastreMunService,
    private cadastreService: CadastreCadastreService,
    private concessionService: CadastreConcessionService,
    private lotService: CadastreLotService
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
   *Load the of lot related to a cadastre
   *
   * @param string codeGeographique
   */
  private loadLots(idCadastreOriginaire: number) {

    if (!this.lotStore.empty) { this.lotStore.clear(); }

    this.lotService.getLots(idCadastreOriginaire)
    .subscribe((lots: LotUnique[]) => {

      this.lotStore.load(lots);

      this.lotStore.view.sort({
        valueAccessor: (lotSort: LotUnique) => lotSort.nomLot,
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
      this.cadastreState.currentCadastreFeature$.next(cadastreList);
    });
    this.cadastreState.currentCadastre$.next(cadastre);
    this.loadConcessions(cadastre.idCadastreOriginaire);
    this.loadLots(cadastre.idCadastreOriginaire);
  }

  /**
   * Reaction on a selected cadastre
   */
  onSelectionConcessionChange(event: {concession: ConcessionUnique}) {
    const concession = event.concession;

    this.concessionService.getConcessionFeatureByNum(concession.listeIdConcession)
    .subscribe((concessionList: ConcessionFeature[]) => {

      this.cadastreState.initConcessionLayer();
      this.concessionLayer = this.cadastreState.layerConcession;
      this.cadastreState.currentConcessionFeatures$.next(concessionList);
      // this.showConcessions(concessionList);

    });
    this.cadastreState.currentConcession$.next(concession);
  }

  /**
   * Reaction on a selected cadastre
   */
  onSelectionLotChange(event: {lot: LotUnique}) {
    const lot = event.lot;

    this.lotService.getLotFeatureByNum(lot.listeIdLot)
    .subscribe((lotList: LotFeature[]) => {

      this.cadastreState.initLotLayer();
      this.lotLayer = this.cadastreState.layerLot;
      this.cadastreState.currentLotFeatures$.next(lotList);
      // this.showLots(lotList);

    });
    this.cadastreState.currentLot$.next(lot);
  }

   /**
   * Reaction on a search click
   *
   * @param {{mun: Mun}} event
   */
  onSearchClick() {
    if (this.cadastreState.currentCadastre$ === undefined) { return; }

    this.showLots(this.cadastreState.currentLotFeatures$.value as LotFeature[]);
    this.showConcessions(this.cadastreState.currentConcessionFeatures$.value as ConcessionFeature[]);
    this.showUnCadastre(this.cadastreState.currentCadastreFeature$.value as CadastreFeature);

  }

  onSearchCancelClick() {
    // Clear the stores
    this.cadastreStore.clear();
    this.concessionStore.clear();
    this.lotStore.clear();

    // clear the selected mun
    this.munStore.state.updateAll({selected: false});

    // Clear the layers
    this.cadastreLayer.dataSource.ol.clear();
    this.concessionLayer.dataSource.ol.clear();
    this.lotLayer.dataSource.ol.clear();

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
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  showConcessions(concessionList: ConcessionFeature[]) {

    if (this.concessionLayer === undefined || this.concessionLayer.dataSource === undefined) { return; }

    this.concessionLayer.dataSource.ol.clear();
    const listConcessionFeature: Feature[] = [];

    concessionList.map((concession: ConcessionFeature) => {
      // Feature conversion to OL Feature
      const feature = featureToOl(concession as Feature, this.cadastreState.mapState.map.projection);
      listConcessionFeature.push(feature);

    });

    this.concessionLayer.dataSource.ol.addFeatures(listConcessionFeature);

    // moveToFeatures(this.cadastreState.mapState.map, listConcessionFeature);
  }

  /**
   * Show the selected cadastre on the map
   * @param CadastreFeature cadastre
   */
  showLots(lotList: LotFeature[]) {

    if (this.lotLayer === undefined || this.lotLayer.dataSource === undefined) { return; }

    this.lotLayer.dataSource.ol.clear();
    const listLotFeature: Feature[] = [];

    lotList.map((lot: LotFeature) => {
      // Feature conversion to OL Feature
      const feature = featureToOl(lot as Feature, this.cadastreState.mapState.map.projection);
      listLotFeature.push(feature);

    });

    this.lotLayer.dataSource.ol.addFeatures(listLotFeature);
  }
}
