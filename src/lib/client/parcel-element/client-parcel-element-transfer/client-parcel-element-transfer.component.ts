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

import { Subscription } from 'rxjs';

import { EntityStore, WidgetComponent } from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

import { Client } from '../../shared/client.interfaces';
import { ClientParcelElement } from '../../parcel-element/shared/client-parcel-element.interfaces';

@Component({
  selector: 'fadq-client-parcel-element-transfer-form',
  templateUrl: './client-parcel-element-transfer.component.html',
  styleUrls: ['./client-parcel-element-transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementTransferComponent implements WidgetComponent, OnInit, OnDestroy {

  private formGroup: FormGroup;

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

  constructor(private formBuilder: FormBuilder) {}

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
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  getClientNumber(client: Client): string {
    return client.info.numero;
  }

  private onTransferAllParcelsChange(value: boolean) {
    if (value === true) {
      this.keepParcelNumbersField.setValue(true);
      this.keepParcelNumbersField.disable();
    } else {
      this.keepParcelNumbersField.enable();
    }
  }

}
