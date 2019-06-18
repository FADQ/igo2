import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { LanguageService } from '@igo2/core';
import { WidgetComponent, OnUpdateInputs } from '@igo2/common';

import { ClientController } from '../../shared/controller';


@Component({
  selector: 'fadq-client-parcel-element-edit',
  templateUrl: './client-parcel-element-edit.component.html',
  styleUrls: ['./client-parcel-element-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementEditComponent implements WidgetComponent, OnUpdateInputs {

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
    private languageService: LanguageService,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Implemented as part of OnUpdateInputs
   */
  onUpdateInputs() {
    this.cdRef.detectChanges();
  }

  onSubmit() {
    this.controller.startParcelEdition();
    this.complete.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

}
