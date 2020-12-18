import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';

import { BehaviorSubject, Observable, Subscription, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService, Message, MessageType } from '@igo2/core';
import {
  EntityRecord,
  EntityTransaction,
  WidgetComponent,
  OnUpdateInputs,
  getEntityRevision
} from '@igo2/common';
import { FeatureStore, IgoMap, formatScale } from '@igo2/geo';

import { EditionResult } from '../../../edition/shared/edition.interfaces';
import { getMapExtentPolygon } from '../../../map/shared/map.utils';

import { ClientParcelElement } from '../shared/client-parcel-element.interfaces';
import { ClientParcelElementService } from '../shared/client-parcel-element.service';
import { getParcelElementValidationMessage } from '../shared/client-parcel-element.utils';

@Component({
  selector: 'fadq-client-parcel-element-without-owner',
  templateUrl: './client-parcel-element-without-owner.component.html',
  styleUrls: ['./client-parcel-element-without-owner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementWithoutOwnerComponent
    implements WidgetComponent, OnUpdateInputs, OnInit, OnDestroy {

  static minZoomLevel = 11;

  /**
   * Message
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Map scale
   * @internal
   */
  readonly scaleText$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  readonly recoverEnabled$: Observable<boolean> = this.message$.pipe(
    map((message: Message) => message !== undefined && message.type === MessageType.INFO)
  );

  private resolution$$: Subscription;

  /**
   * Parcel element store
   */
  @Input() store: FeatureStore<ClientParcelElement>;

  /**
   * Parcel element transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Map
   */
  @Input() map: IgoMap;

  /**
   * Parcel annee
   */
  @Input() annee: number;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private clientParcelElementService: ClientParcelElementService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.resolution$$ = this.map.viewController.resolution$.subscribe(() => {
      // *************************** TODO *****************************
      // const scale = this.map.viewController.getScale();
      // this.scaleText$.next('~ 1 / ' + formatScale(scale));
      const zoom = this.map.viewController.getZoom();
      this.scaleText$.next('Niveau de zoom actuel:' + zoom);
    });
    this.onRefresh();
  }

  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onCancel() {
    this.clearParcelElements();
    this.cancel.emit();
  }

  onRefresh() {
    if (this.map.viewController.getZoom() > ClientParcelElementWithoutOwnerComponent.minZoomLevel) {
      this.refresh();
    } else {
      this.onWrongZoomLevel();
    }
  }

  onRecover() {
    this.recover().subscribe((bunch: [string, ClientParcelElement[]]) => {
      const [error, parcelElements] = bunch;
      this.setError(error);
      if (error === undefined) {
        parcelElements.forEach((parcelElement: ClientParcelElement) => {
          this.addToTransaction(parcelElement);
        });
        this.clearParcelElements();
        this.complete.emit();
      }
    });
  }

  private recover(): Observable<[string, ClientParcelElement[]]> {
    const results$ = this.store.stateView
      .manyBy((record: EntityRecord<ClientParcelElement>) => {
        return record.entity.properties.noOwner === true && record.state.selected === true;
      })
      .map((record: EntityRecord<ClientParcelElement>) => {
        return this.processParcelElement(record.entity);
      });

    return zip(...results$).pipe(
      map((results: EditionResult[]) => {
        const firstResultWithError = results.find((result: EditionResult) => result.error !== undefined);
        const error = firstResultWithError ? firstResultWithError.error : undefined;

        let parcelElements = [];
        if (error === undefined) {
          parcelElements = results.map((result: EditionResult) => result.feature);
        }
        return [error, parcelElements] as [string, ClientParcelElement[]];
      })
    );
  }

  private refresh() {
    const extentGeometry = getMapExtentPolygon(this.map, 'EPSG:4326');
    this.clientParcelElementService.getParcelElementsWithoutOwner(extentGeometry, this.annee)
      .subscribe((parcelElements: ClientParcelElement[]) => {
        this.clearParcelElements();
        // Filter new parcel elements. If we don't filter and a parcel element
        // with the same id already exists, it'll will be replaced and we don't want
        // that. It could even be added twice to the schema.
        const newParcelElements = parcelElements
          .filter((parcelElement: ClientParcelElement) => {
            return this.store.get(this.store.getKey(parcelElement)) === undefined &&
              this.transaction.getOperationByEntity(parcelElement) === undefined;
          });
        if (newParcelElements.length === 0) {
          this.onNoParcelElementsFound();
        } else {
          this.onParcelElementsFound(newParcelElements);
        }
      });
  }

  private onWrongZoomLevel() {
    const textKey = 'client.parcelElement.recoverParcelsWithoutOwner.wrongZoomLevel';
    const minZoomLevel = ClientParcelElementWithoutOwnerComponent.minZoomLevel;
    const text = this.languageService.translate.instant(textKey, {minZoomLevel});
    this.message$.next({
      type: MessageType.ERROR,
      text
    });
  }

  private onNoParcelElementsFound() {
    const textKey = 'client.parcelElement.recoverParcelsWithoutOwner.noParcelFound';
    const text = this.languageService.translate.instant(textKey);
    this.message$.next({
      type: MessageType.ERROR,
      text
    });
  }

  private onParcelElementsFound(parcelElements: ClientParcelElement[]) {
    // Need to do that because parcels without owner may have the same id, meaning
    // that the count may be smaller than the number of parcels without owner found.
    const countBefore = this.store.count;
    this.store.insertMany(parcelElements);
    const count = this.store.count - countBefore;

    const textKey = 'client.parcelElement.recoverParcelsWithoutOwner.parcelFound';
    const text = this.languageService.translate.instant(textKey, {count});
    this.message$.next({
      type: MessageType.INFO,
      text
    });
  }

  private clearParcelElements() {
    const parcelElements = this.store.all()
      .filter((parcelElement: ClientParcelElement) => parcelElement.properties.noOwner === true);
    this.store.deleteMany(parcelElements);
  }

  private processParcelElement(data: ClientParcelElement): Observable<EditionResult> {
    return this.clientParcelElementService.createParcelElement(data)
      .pipe(
        map((parcelElement: ClientParcelElement): EditionResult => {
          parcelElement.meta.revision = getEntityRevision(parcelElement) + 1;
          return {
            feature: parcelElement,
            error: getParcelElementValidationMessage(parcelElement, this.languageService)
          };
        })
      );
  }

  /**
   * Add the new or updated feature to the transaction
   * @param feature Feature
   */
  private addToTransaction(parcelElement: ClientParcelElement) {
    const operationTitle = parcelElement.properties.noParcelleAgricole;
    this.transaction.insert(parcelElement, this.store, {
      title: operationTitle
    });
  }

  private setError(text: string | undefined) {
    if (text === undefined) {
      this.message$.next(undefined);
    } else {
      this.message$.next({
        type: MessageType.ERROR,
        text: text
      });
    }
  }

}
