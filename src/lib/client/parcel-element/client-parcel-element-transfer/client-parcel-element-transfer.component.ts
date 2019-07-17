import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { Subscription, BehaviorSubject, of } from 'rxjs';

import { Message, MessageType, LanguageService } from '@igo2/core';
import { EntityRecord, EntityStore, WidgetComponent } from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElement } from '../../parcel-element/shared/client-parcel-element.interfaces';
import { ClientParcelElementService } from '../../parcel-element/shared/client-parcel-element.service';

@Component({
  selector: 'fadq-client-parcel-element-transfer-form',
  templateUrl: './client-parcel-element-transfer.component.html',
  styleUrls: ['./client-parcel-element-transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementTransferComponent implements WidgetComponent, OnInit, OnDestroy {

  formGroup: FormGroup;

  /**
   * Error or success message, if any
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  get toClient(): Client { return this.toClient$.value; }
  readonly toClient$: BehaviorSubject<Client> = new BehaviorSubject(undefined);

  private transferAllParcels$$: Subscription;

  get keepParcelNumbers(): boolean { return this.keepParcelNumbersField.value; }
  get keepParcelNumbersField(): FormControl {
    return (this.formGroup.controls as any).keepParcelNumbers as FormControl;
  }

  get transferAllParcels(): boolean { return this.transferAllParcelsField.value; }
  get transferAllParcelsField(): FormControl {
    return (this.formGroup.controls as any).transferAllParcels as FormControl;
  }

  /**
   * Client
   */
  @Input() client: Client;

  /**
   * Parcel annee
   */
  @Input() annee: number;

  /**
   * Client store
   */
  @Input() clientStore: EntityStore<Client>;

  /**
   * Parcel element store
   */
  @Input() parcelElementStore: FeatureStore<ClientParcelElement>;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private formBuilder: FormBuilder,
    private clientParcelElementService: ClientParcelElementService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      keepParcelNumbers: false,
      transferAllParcels: false
    });

    this.transferAllParcels$$ = this.transferAllParcelsField.valueChanges
      .subscribe((value: boolean) => this.onTransferAllParcelsChange(value));
  }

  ngOnDestroy() {
    this.transferAllParcels$$.unsubscribe();
  }

  onTransfer() {
    this.clientParcelElementService.validateTransfer(
      this.toClient,
      this.annee
    ).subscribe((valid: boolean) => {
      if (valid === true) {
        this.doTransfer();
      }
      this.onValidationError();
    });
  }

  private doTransfer() {
    const parcelElements = this.getParcelElementsToTransfer();
    const parcelElementIds = parcelElements
      .map((parcelElement: ClientParcelElement) => parcelElement.properties.idParcelle);
    this.clientParcelElementService.transfer(
      this.client,
      this.toClient,
      this.annee,
      parcelElementIds,
      this.keepParcelNumbers
    ).subscribe(() => this.onTransferSuccess(parcelElements));
  }

  onCancel() {
    this.cancel.emit();
  }

  getClientNumber(client: Client): string {
    return client.info.numero;
  }

  onSelectClient(event: {selected: boolean; value: Client}) {
    if (event.selected === true) {
      this.toClient$.next(event.value);
    } else {
      this.toClient$.next(undefined);
    }
  }

  private onValidationError() {
    this.message$.next({
      type: MessageType.ERROR,
      text: this.languageService.translate.instant('client.parcelElement.validation.error')
    });
  }

  private onTransferSuccess(parcelElements: ClientParcelElement[]) {
    this.parcelElementStore.deleteMany(parcelElements);
    this.complete.emit();
  }

  private onTransferAllParcelsChange(value: boolean) {
    if (value === true) {
      this.keepParcelNumbersField.setValue(true);
      this.keepParcelNumbersField.disable();
    } else {
      this.keepParcelNumbersField.enable();
    }
  }

  private getParcelElementsToTransfer(): ClientParcelElement[] {
    if (this.transferAllParcels === true) {
      return this.parcelElementStore.view.all();
    }

    return this.parcelElementStore.stateView
      .manyBy((record: EntityRecord<ClientParcelElement>) => record.state.selected === true)
      .map((record: EntityRecord<ClientParcelElement>) => record.entity);
  }

}
