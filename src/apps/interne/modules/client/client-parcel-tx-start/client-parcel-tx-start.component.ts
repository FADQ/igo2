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

import {
  ClientParcelTxService,
  ClientParcelTxState
} from 'src/lib/client';
import { SubmitStep, SubmitHandler } from 'src/lib/utils';

import { ClientController } from '../shared/client-controller';

@Component({
  selector: 'fadq-client-parcel-tx-start',
  templateUrl: './client-parcel-tx-start.component.html',
  styleUrls: ['./client-parcel-tx-start.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelTxStartComponent
    implements WidgetComponent, OnUpdateInputs, OnInit, OnDestroy {

  /**
   * Message
   * @internal
   */
  readonly message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  /**
   * Wheter there is an error
   * @internal
   */
  readonly error$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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

  /**
   * Client controller
   */
  @Input() controller: ClientController;

   /**
   * Edition state
   */
  @Input() state: ClientParcelTxState;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private clientParcelTxService: ClientParcelTxService,
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Validate the tx state and the year
   * @internal
   */
  ngOnInit() {
    const error = this.validateState();
    if (error !== undefined) {
      this.message$.next({
        type: MessageType.ERROR,
        text: error
      });
      this.error$.next(true);
    } else if (!this.controller.parcelYear.current) {
      const messageKey = 'client.parcelTx.start.notCurrentYear';
      this.message$.next({
        type: MessageType.ALERT,
        text: this.languageService.translate.instant(messageKey)
      });
    }
  }

  /**
   * Destroy the submit handler
   * @internal
   */
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
    if (this.state === ClientParcelTxState.OK) {
      this.onSubmitSuccess();
    } else {
      const submit$ = this.clientParcelTxService.prepareParcelTx(
        this.controller.client, this.controller.parcelYear.annee
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
    if (state === ClientParcelTxState.AI) {
      return this.languageService.translate.instant('client.parcelElement.edition.ai.error');
    }
    if (state === ClientParcelTxState.EEC) {
      return this.languageService.translate.instant('client.parcelElement.edition.eec.error');
    }
    return undefined;
  }
}
