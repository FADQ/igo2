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

import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { LanguageService } from '@igo2/core/language';
import { Message, MessageType } from '@igo2/core/message';
import {
  EntityOperation,
  EntityOperationType,
  EntityTransaction,
  EntityTableTemplate,
  EntityTableColumnRenderer,
  EntityTableButton,
  getEntityRevision,
  EntityStore,
  EntityRecord
} from '@igo2/common/entity';

import { FeatureStore } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import { ClientParcelElement } from '../shared/client-parcel-element.interfaces';
import { ClientParcelElementService } from '../shared/client-parcel-element.service';
import { MultipartNoParcel } from './client-parcel-element-numbering-input.component';
import { asEntityStore } from '@lib/compatibility/igo2-compat';

@Component({
  selector: 'fadq-client-parcel-element-numbering',
  templateUrl: './client-parcel-element-numbering.component.html',
  styleUrls: ['./client-parcel-element-numbering.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementNumberingComponent implements OnInit, OnDestroy {

  // 🎯 SINGLE SOURCE OF TRUTH
  readonly valueControl = new FormControl<MultipartNoParcel>({
    number: '',
    prefix: '',
    suffix: ''
  }, { nonNullable: true });

  readonly message$ = new BehaviorSubject<Message | undefined>(undefined);

  private parcelElement$$?: Subscription;
  private value$$?: Subscription;
  private lastUpdate?: ClientParcelElement;

  @Input() store!: FeatureStore<ClientParcelElement>;
  @Input() transaction!: EntityTransaction;

  @Output() complete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  readonly subTransaction = new EntityTransaction();

  // 🧾 TABLE TEMPLATE (requis par le HTML)
  readonly tableTemplate: EntityTableTemplate = {
    selection: false,
    sort: false,
    columns: [
      {
        name: 'previous',
        title: 'Précédent',
        valueAccessor: (entity: any) => {
          const op = entity as EntityOperation<ClientParcelElement>;
          return op.meta.previous;
        }
      },
      {
        name: 'current',
        title: 'Nouveau',
        valueAccessor: (entity: any) => {
          const op = entity as EntityOperation<ClientParcelElement>;
          return op.meta.current;
        }
      },
      {
        name: 'action',
        title: '',
        renderer: EntityTableColumnRenderer.ButtonGroup,
        valueAccessor: (entity: any): EntityTableButton[] => {
          const op = entity as EntityOperation<ClientParcelElement>;
          return [{
            icon: 'delete',
            click: () => this.deleteOperation(op)
          }];
        }
      }
    ]
  };

  constructor(
    private clientParcelElementService: ClientParcelElementService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.store.state.updateAll({ selected: false });

    this.initValue();

    // 🧠 validation réactive
    this.value$$ = this.valueControl.valueChanges.subscribe(value => {
      const [message, type] = this.validate(value);

      if (!message) {
        this.message$.next(undefined);
      } else {
        this.message$.next({
          type,
          text: message
        });
      }
    });

    this.subTransaction.operations.view.sort({
      direction: 'desc',
      valueAccessor: (op: EntityOperation) => op.meta.index
    });

    this.parcelElement$$ = this.store.stateView
      .firstBy$((r: EntityRecord<ClientParcelElement>) => r.state.selected === true)
      .pipe(skip(1))
      .subscribe(r => {
        const entity = r?.entity;
        if (entity) {
          this.onSelectParcelElement(entity);
        }
      });
  }

  ngOnDestroy() {
    this.parcelElement$$?.unsubscribe();
    this.value$$?.unsubscribe();
  }

  // 🎯 Helpers

  private computeParcelElementNumber(value: MultipartNoParcel): string {
    return [
      value.prefix || '',
      value.number || '',
      value.suffix || ''
    ].join('').toUpperCase();
  }

  private initValue() {
    const allNumbers = this.store.all()
      .map(e => parseInt(e.properties.noParcelleAgricole, 10))
      .filter(n => !isNaN(n));

    const max = allNumbers.length ? Math.max(...allNumbers) : 0;

    this.valueControl.setValue({
      prefix: '',
      number: String(max + 1),
      suffix: ''
    }, { emitEvent: false });
  }

  private onSelectParcelElement(parcelElement: ClientParcelElement) {
    if (this.lastUpdate?.meta.id === parcelElement.meta.id) return;

    const value = this.valueControl.value;
    const number = this.computeParcelElementNumber(value);

    this.updateParcelElement(parcelElement, number);
  }

  private updateParcelElement(parcelElement: ClientParcelElement, number: string) {
    const data = ObjectUtils.mergeDeep(parcelElement, {
      properties: {
        noParcelleAgricole: number
      },
      meta: {
        revision: getEntityRevision(parcelElement) + 1
      }
    });

    this.clientParcelElementService
      .createParcelElement(data)
      .subscribe(newEntity => {
        this.addToSubTransaction(newEntity);
        this.incrementValue();
      });
  }

  private incrementValue() {
    const v = this.valueControl.value;
    const n = parseInt(v.number, 10);

    if (!isNaN(n)) {
      this.valueControl.setValue({
        ...v,
        number: String(n + 1)
      }, { emitEvent: false });
    }
  }

  private validate(value: MultipartNoParcel): [string | undefined, MessageType | undefined] {
    const number = this.computeParcelElementNumber(value);

    if (number.length > 4) {
      return [
        this.languageService.translate.instant(
          'client.parcelElement.numbering.numberTooLong.error'
        ),
        MessageType.ERROR
      ];
    }

    const all = this.store.all().map(e => e.properties.noParcelleAgricole);

    if (all.includes(number)) {
      return [
        this.languageService.translate.instant(
          'client.parcelElement.numbering.numberInUse.error'
        ),
        MessageType.ALERT
      ];
    }

    return [undefined, undefined];
  }

  private addToSubTransaction(parcelElement: ClientParcelElement) {
    const current = parcelElement.properties.noParcelleAgricole;
    const source = this.store.get(parcelElement.meta.id);

    const op = this.subTransaction.getOperationByEntity(parcelElement);
    const previous = op?.meta.previous ?? source.properties.noParcelleAgricole;

    this.subTransaction.update(
      source,
      parcelElement,
      asEntityStore(this.store),
      {
        previous,
        current,
        index: this.computeOperationIndex()
      }
    );
  }

  private computeOperationIndex(): number {
    const indexes = this.subTransaction.operations.all()
      .map(o => o.meta.index);

    return indexes.length ? Math.max(...indexes) + 1 : 0;
  }

  private deleteOperation(operation: EntityOperation<ClientParcelElement>) {
    const op = operation as unknown as EntityOperation<any>;

    const lastUpdateId =
      this.lastUpdate === undefined ? undefined : this.lastUpdate.meta.id;

    const parcelId = op.current.meta.id;

    if (parcelId === lastUpdateId) {
      this.store.state.update(this.lastUpdate, { selected: false });
      this.lastUpdate = undefined;
    }

    this.subTransaction.rollbackOperations([op]);
  }

  onComplete() {
    this.mergeSubTransaction();
    this.complete.emit();
  }

  onCancel() {
    this.rollbackSubTransaction();
    this.cancel.emit();
  }

  private rollbackSubTransaction() {
    this.subTransaction.rollback();
  }

  private mergeSubTransaction() {
    const ops = this.subTransaction.operations.all();

    ops.forEach(op => {
      const current = op.current as ClientParcelElement;
      const previous = op.previous as ClientParcelElement;

      const parentOp = this.transaction.getOperationByEntity(current);
      const store = this.store as unknown as EntityStore<object>;

      if (parentOp?.type === EntityOperationType.Insert) {
        this.transaction.insert(current, store, op.meta);
      } else {
        this.transaction.update(previous, current, store, op.meta);
      }
    });

    this.subTransaction.clear();
  }
}
