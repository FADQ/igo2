import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { BehaviorSubject, Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService, Message, MessageType } from '@igo2/core';
import {
  EntityRecord,
  EntityTransaction,
  WidgetComponent,
  OnUpdateInputs
} from '@igo2/common';
import { FeatureStore, IgoMap } from '@igo2/geo';

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
    implements WidgetComponent, OnUpdateInputs, OnInit {

  static minZoomLevel = 11;

  /**
   * Message, if any
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  readonly recoverEnabled$: Observable<boolean> = this.message$.pipe(
    map((message: Message) => message !== undefined && message.type === MessageType.INFO)
  );

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
    this.onRefresh();
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
        parcelElements.forEach((parcelElement: ClientParcelElement) => this.addToTransaction(parcelElement));
        this.complete.emit();
      }
    });
  }

  private recover(): Observable<[string, ClientParcelElement[]]> {
    this.clearParcelElements();

    const results$ = this.store.stateView
      .manyBy((record: EntityRecord<ClientParcelElement>) => {
        return record.entity.properties.noOwner === true && record.state.selected === true;
      })
      .map((record: EntityRecord<ClientParcelElement>) => this.processParcelElement(record.entity));

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
    this.clientParcelElementService.getParcelElementsWithoutOwner(extentGeometry)
      .subscribe((parcelElements: ClientParcelElement[]) => {
        // TODO: remove
        parcelElements = parcelElements.slice(0, 5);
        this.clearParcelElements();
        if (parcelElements.length === 0) {
          this.onNoParcelElementsFound();
        } else {
          this.onParcelElementsFound(parcelElements);
        }
      });
  }

  private onWrongZoomLevel() {
    const textKey = 'client.parcelElement.recoverParcelsWithoutOwner.wrongZoomLevel';
    const text = this.languageService.translate.instant(textKey);
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
