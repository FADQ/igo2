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

import { Subscription, BehaviorSubject, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { Message, MessageType, LanguageService } from '@igo2/core';
import { EntityRecord, EntityStore, WidgetComponent } from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

import { SubmitStep, SubmitHandler } from '../../../utils';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElement } from '../../parcel-element/shared/client-parcel-element.interfaces';
import { ClientParcelElementService } from '../../parcel-element/shared/client-parcel-element.service';

@Component({
  selector: 'fadq-client-parcel-element-transfer',
  templateUrl: './client-parcel-element-transfer.component.html',
  styleUrls: ['./client-parcel-element-transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementTransferComponent implements WidgetComponent, OnInit, OnDestroy {

  formGroup: FormGroup;

  /**
   * Message
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Submit step enum
   * @internal
   */
  readonly submitStep = SubmitStep;

  /**
   * Submit handler
   * @internal
   */
  readonly submitHandler = new SubmitHandler();

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
  @Output() complete = new EventEmitter<Client>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private formBuilder: FormBuilder,
    private clientParcelElementService: ClientParcelElementService,
    private languageService: LanguageService
  ) {}

  /**
   * Build the form and subscribe to the
   * transfer all field
   * @internal
   */
  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      keepParcelNumbers: false,
      transferAllParcels: false
    });

    this.transferAllParcels$$ = this.transferAllParcelsField.valueChanges
      .subscribe((value: boolean) => this.onTransferAllParcelsChange(value));
  }

  /**
   * Destroy the submit handler and unsubscribe to the
   * transfer all field
   * @internal
   */
  ngOnDestroy() {
    this.submitHandler.destroy();
    this.transferAllParcels$$.unsubscribe();
  }

  onTransfer() {
    const parcelElements = this.getParcelElementsToTransfer();
    if (parcelElements.length === 0) {
      this.message$.next({
        type: MessageType.ERROR,
        text: this.languageService.translate.instant('client.parcelElement.transfer.error.empty')
      });
      return;
    }

    const parcelElementIds = parcelElements
      .map((parcelElement: ClientParcelElement) => parcelElement.properties.idParcelle);

    const validate$ = this.clientParcelElementService.validateTransfer(
      this.toClient,
      this.annee
    );

    const transfer$ = this.clientParcelElementService.transfer(
      this.client,
      this.toClient,
      this.annee,
      parcelElementIds,
      this.keepParcelNumbers
    );

    const submit$ = validate$.pipe(
      concatMap((valid: boolean) => {
        if (valid === true) {
          return transfer$;
        }
        return throwError({valid});
      })
    );

    this.submitHandler.handle(submit$, {
      success: () => this.onSubmitSuccess(parcelElements),
      error: () => this.onValidationError()
    }).submit();
  }

  onCancel() {
    this.submitHandler.destroy();

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
      text: this.languageService.translate.instant('client.parcelElement.transfer.error.invalid')
    });
  }

  private onSubmitSuccess(parcelElements: ClientParcelElement[]) {
    this.parcelElementStore.deleteMany(parcelElements);
    this.complete.emit(this.toClient);
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
