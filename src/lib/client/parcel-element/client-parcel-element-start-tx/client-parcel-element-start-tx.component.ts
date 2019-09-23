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

import { BehaviorSubject } from 'rxjs';

import { LanguageService, Message, MessageType } from '@igo2/core';
import { WidgetComponent, OnUpdateInputs } from '@igo2/common';

import { SubmitStep, SubmitHandler } from '../../../utils';
import { ClientController } from '../../shared/client-controller';
import { ClientParcelElementTxService } from '../shared/client-parcel-element-tx.service';
import { ClientParcelElementTxState } from '../shared/client-parcel-element.enums';

@Component({
  selector: 'fadq-client-parcel-element-start-tx',
  templateUrl: './client-parcel-element-start-tx.component.html',
  styleUrls: ['./client-parcel-element-start-tx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementStartTxComponent
    implements WidgetComponent, OnUpdateInputs, OnInit, OnDestroy {

  /**
   * Message, if any
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  readonly submitStep = SubmitStep;

  readonly submitHandler = new SubmitHandler();

  /**
   * Client controller
   */
  @Input() controller: ClientController;

   /**
   * Edition state
   */
  @Input() state: ClientParcelElementTxState;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private clientParcelElementTxService: ClientParcelElementTxService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const error = this.validateState();
    if (error !== undefined) {
      this.message$.next({
        type: MessageType.ERROR,
        text: error
      });
    }
  }

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
    if (this.state === ClientParcelElementTxState.OK) {
      this.onSubmitSuccess();
    } else {
      const submit$ = this.clientParcelElementTxService.prepareParcelTx(
        this.controller.client, this.controller.parcelYear
      );
      this.submitHandler.handle(submit$, {
        success: () => this.onSubmitSuccess()
      }).submit();
    }
  }

  onCancel() {
    this.submitHandler.destroy();
    this.cancel.emit();
  }

  private onSubmitSuccess() {
    this.controller.activateParcelElements();
    this.complete.emit();
  }

  private validateState(): string | undefined {
    const state = this.state;
    if (state === ClientParcelElementTxState.AI) {
      return this.languageService.translate.instant('client.parcelElement.edition.ai.error');
    }
    if (state === ClientParcelElementTxState.EEC) {
      return this.languageService.translate.instant('client.parcelElement.edition.eec.error');
    }
    return undefined;
  }
}
