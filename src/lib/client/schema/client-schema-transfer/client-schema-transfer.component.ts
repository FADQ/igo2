import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';

import { Message, MessageType, LanguageService } from '@igo2/core';
import { EntityStore, Form, WidgetComponent, OnUpdateInputs } from '@igo2/common';

import { Client } from '../../shared/client.interfaces';

import { ClientSchema, ClientSchemaMessageTransferResponse } from '../shared/client-schema.interfaces';
import { ClientSchemaService } from '../shared/client-schema.service';
import { ClientSchemaFormService } from '../shared/client-schema-form.service';

@Component({
  selector: 'fadq-client-schema-transfer',
  templateUrl: './client-schema-transfer.component.html',
  styleUrls: ['./client-schema-transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaTransferComponent implements OnInit, OnUpdateInputs, WidgetComponent {

  /**
   * Transfer form
   * @internal
   */
  form$: BehaviorSubject<Form> = new BehaviorSubject<Form>(undefined);

  /**
   * Message
   * @internal
   */
  message$: BehaviorSubject<Message> = new BehaviorSubject(undefined);

  isDisabled: boolean = false;

  labelCancelButton: string = this.languageService.translate.instant('cancel');

  /**
   * Client
   */
  @Input() client: Client;

  /**
   * Schema store
   */
  @Input() store: EntityStore<ClientSchema>;

  /**
   * Schema to update
   */
  @Input() schema: ClientSchema;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private clientSchemaService: ClientSchemaService,
    private clientSchemaFormService: ClientSchemaFormService,
    private cdRef: ChangeDetectorRef,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.clientSchemaFormService.buildTransferForm()
      .subscribe((form: Form) => this.form$.next(form));
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  /**
   * On submit, transfer the schema to a new client.
   * @param data Schema data
   */
  onSubmit(data: {[key: string]: any}) {
    this.clientSchemaService.transferSchema(this.schema, data.numeroClient)
      .subscribe((messages: ClientSchemaMessageTransferResponse[]) => {
        if (messages.length === 0) {
          this.onSubmitSuccess();
        } else {
          this.onSubmitError(messages);
        }
      });
  }

  /**
   * Emit cancel event
   */
  onCancel() {
    this.cancel.emit();
  }

  /**
   * On submit success, delete the schema from the store (since it doesn't belong)
   * to the current client anymore.
   */
  private onSubmitSuccess() {
    this.setError(undefined);
    this.store.delete(this.schema);
    this.complete.emit();
  }

  /**
   * On submit error, display an error message
   */
  private onSubmitError(messages: ClientSchemaMessageTransferResponse[]) {
    this.isDisabled = true;
    this.labelCancelButton = this.languageService.translate.instant('close');
    this.setError(messages[0].libelle);
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
