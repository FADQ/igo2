import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import { WidgetComponent, OnUpdateInputs } from '@igo2/common';

import { SubmitStep, SubmitHandler } from '../../../utils';

import { ClientController } from '../../shared/controller';
import { ClientParcelElementService } from '../shared/client-parcel-element.service';

@Component({
  selector: 'fadq-client-parcel-element-delete-tx',
  templateUrl: './client-parcel-element-delete-tx.component.html',
  styleUrls: ['./client-parcel-element-delete-tx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementDeleteTxComponent
    implements OnUpdateInputs, WidgetComponent, OnDestroy {

  readonly submitStep = SubmitStep;

  readonly submitHandler = new SubmitHandler();

  /**
   * Client controller
   */
  @Input() controller: ClientController;

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
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnDestroy() {
    this.submitHandler.destroy();
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit() {
    const submit$ = this.clientParcelElementService.deleteParcelTx(
      this.controller.client,
      this.controller.parcelYear
    );
    this.submitHandler.handle(submit$, {
      success: () => this.onSubmitSuccess()
    }).submit();
  }

  onCancel() {
    this.submitHandler.destroy();
    this.cancel.emit();
  }

  private onSubmitSuccess() {
    this.controller.deactivateParcelTx();
    this.complete.emit();
  }

}
