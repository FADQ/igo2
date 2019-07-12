import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { LanguageService } from '@igo2/core';
import { WidgetComponent, OnUpdateInputs } from '@igo2/common';

import { ClientController } from '../../shared/controller';
import { ClientParcelElementEditionState} from '../shared/client-parcel-element.enums';

@Component({
  selector: 'fadq-client-parcel-element-edit',
  templateUrl: './client-parcel-element-edit.component.html',
  styleUrls: ['./client-parcel-element-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementEditComponent implements WidgetComponent, OnUpdateInputs, OnInit {

  /**
   * Import error, if any
   * @internal
   */
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * Client controller
   */
  @Input() controller: ClientController;

   /**
   * Edition state
   */
  @Input() state: ClientParcelElementEditionState;

  /**
   * Event emitted on complete
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Event emitted on cancel
   */
  @Output() cancel = new EventEmitter<void>();

  constructor(
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const error = this.validateState();
    this.errorMessage$.next(error);
  }

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit() {
    if (this.state === ClientParcelElementEditionState.OK) {
      this.onSubmitSuccess();
    } else {
      this.controller.prepareParcelEdition().subscribe(() => {
        this.onSubmitSuccess();
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  private onSubmitSuccess() {
    this.controller.activateParcelEdition();
    this.complete.emit();
  }

  private validateState(): string | undefined {
    const state = this.state;
    if (state === ClientParcelElementEditionState.AI) {
      return this.languageService.translate.instant('client.parcelElement.edition.ai.error');
    }
    if (state === ClientParcelElementEditionState.EEC) {
      return this.languageService.translate.instant('client.parcelElement.edition.eec.error');
    }

    return undefined;
  }
}
