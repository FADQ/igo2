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

import { BehaviorSubject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  EntityRecord,
  EntityOperation,
  EntityTransaction,
  EntityTableTemplate,
  EntityTableColumnRenderer,
  EntityTableButton,
  WidgetComponent,
  getEntityTitle,
  getEntityRevision,
} from '@igo2/common';
import { FeatureStore } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import { ClientParcelElement } from '../shared/client-parcel-element.interfaces';
import { ClientParcelElementService } from '../shared/client-parcel-element.service';
import { MultipartNoParcel } from './client-parcel-element-numbering-input.component';

@Component({
  selector: 'fadq-client-parcel-element-numbering',
  templateUrl: './client-parcel-element-numbering.component.html',
  styleUrls: ['./client-parcel-element-numbering.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementNumberingComponent implements WidgetComponent, OnInit, OnDestroy {

  set value(value: MultipartNoParcel) { this.setValue(value); }
  get value(): MultipartNoParcel { return this._value; }
  private _value: MultipartNoParcel = {number: '', prefix: '', suffix: ''};

  /**
   * Import error, if any
   * @internal
   */
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  tableTemplate: EntityTableTemplate = {
    selection: false,
    sort: false,
    columns: [
      {
        name: '_',
        title: '',
        valueAccessor: (operation: EntityOperation) => ''
      },
      {
        name: 'title',
        title: '',
        valueAccessor: (operation: EntityOperation<ClientParcelElement>) => {
          return getEntityTitle(operation);
        }
      },
      {
        name: 'action',
        title: '',
        renderer: EntityTableColumnRenderer.ButtonGroup,
        valueAccessor: (operation: EntityOperation<ClientParcelElement>): EntityTableButton[] => {
          return [{
            icon: 'delete',
            click: (_operation: EntityOperation<ClientParcelElement>) => {
              this.deleteOperation(_operation);
            }
          }];
        }
      }
    ]
  };

  private parcelElement$$: Subscription;

  private lastUpdate: ClientParcelElement;

  /**
   * Parcel element store
   */
  @Input() store: FeatureStore<ClientParcelElement>;

  /**
   * Parcel element transaction
   */
  @Input() transaction: EntityTransaction;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  get subTransaction(): EntityTransaction { return this._subTransaction; }
  private _subTransaction: EntityTransaction = new EntityTransaction();

  constructor(
    private clientParcelElementService: ClientParcelElementService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initValue();

    this.subTransaction.operations.view.sort({
      direction: 'desc',
      valueAccessor: (operation: EntityOperation) => operation.meta.index
    });

    this.parcelElement$$ = this.store.stateView
      .firstBy$((record: EntityRecord<ClientParcelElement>) => record.state.selected === true)
      .pipe(skip(1))
      .subscribe((record: EntityRecord<ClientParcelElement>) => {
        const parcelElement = record ? record.entity : undefined;
        if (parcelElement !== undefined) {
          this.onSelectParcelElement(parcelElement);
        }
      });
  }

  ngOnDestroy() {
    this.parcelElement$$.unsubscribe();
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onComplete() {
    this.mergeSubTransaction();
    this.complete.emit();
  }

  onCancel() {
    this.rollbackSubTransaction();
    this.cancel.emit();
  }

  private onSelectParcelElement(parcelElement: ClientParcelElement) {
    if (this.lastUpdate !== undefined && parcelElement.properties.id === this.lastUpdate.properties.id) {
      return;
    }
    if (this.errorMessage$.value !== undefined) {
      return;
    }

    this.lastUpdate = parcelElement;
    this.updateParcelElement(parcelElement);
  }

  private updateParcelElement(parcelElement: ClientParcelElement) {
    const data = ObjectUtils.mergeDeep(parcelElement, {
      properties: {
        noParcelleAgricole: this.computeParcelElementNumber()
      },
      meta: {
        revision: getEntityRevision(parcelElement) + 1
      }
    });

    return this.clientParcelElementService
      .createParcelElement(data)
      .subscribe((newParcelElement: ClientParcelElement) => {
        this.addToSubTransaction(newParcelElement);
        this.incrementValue();
      });
  }

  private computeParcelElementNumber(): string {
    const value = this.value;
    return [value.prefix || '', value.number || '', value.suffix || ''].join('');
  }

  private initValue() {
    const allNumbers = this.store.all()
      .map((parcelElement: ClientParcelElement) => {
        return parseInt(parcelElement.properties.noParcelleAgricole, 10);
      })
      .filter((number: number) => !isNaN(number));
    const maxNumber = allNumbers.length > 0 ? Math.max(...allNumbers) : 1;
    this.setValueNumber(maxNumber + 1);
  }

  private incrementValue() {
    const value = this.value;
    const currentNumber = parseInt(value.number, 10);
    if (!isNaN(currentNumber)) {
      this.setValueNumber(currentNumber + 1);
    }
  }

  private setValueNumber(number: number) {
    const value = Object.assign({}, this.value, {number: '' + number});
    this.setValue(value);
  }

  private setValue(value: MultipartNoParcel) {
    this._value = value;
    const error = this.validateValue();
    this.errorMessage$.next(error);
  }

  private validateValue(): string | undefined {
    const value = this.computeParcelElementNumber();
    const allValues = this.store.all().map((parcelElement: ClientParcelElement) => {
      return parcelElement.properties.noParcelleAgricole;
    });

    if (allValues.includes(value)) {
      return this.languageService.translate.instant('client.parcelElement.numbering.numberInUse.error');
    }

    // TODO: Validate format

    return undefined;
  }

  private addToSubTransaction(parcelElement: ClientParcelElement) {
    const operationTitle = parcelElement.properties.noParcelleAgricole;
    const sourceParcelElement = this.store.get(parcelElement.properties.id);
    this.subTransaction.update(sourceParcelElement, parcelElement, this.store, {
      title: operationTitle,
      index: this.computeOperationIndex()
    });
  }

  private computeOperationIndex(): number {
    const allIndexes = this.subTransaction.operations.all()
      .map((operation: EntityOperation) => operation.meta.index);
    const maxIndex = allIndexes.length > 0 ? Math.max(...allIndexes) : 0;
    return maxIndex + 1;
  }

  private mergeSubTransaction() {
    this.transaction.mergeTransaction(this.subTransaction);
    this.subTransaction.clear();
  }

  private rollbackSubTransaction() {
    this.subTransaction.rollback();
  }

  private deleteOperation(operation: EntityOperation<ClientParcelElement>) {
    if (operation.current.properties.id === this.lastUpdate.properties.id) {
      this.store.state.update(this.lastUpdate, {selected: false});
      this.lastUpdate = undefined;
    }
    this.subTransaction.rollbackOperations([operation]);
  }

}
