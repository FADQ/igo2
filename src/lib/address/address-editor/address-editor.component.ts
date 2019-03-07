import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { FormGroup } from '@angular/forms';

/**
 * Tool to edit addresses from Adresse Quebec.
 */
@Component({
  selector: 'fadq-address-editor',
  templateUrl: './address-editor.component.html',
  styleUrls: ['./address-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressEditorComponent implements OnDestroy {
  public form: FormGroup;
  public submitted: boolean;
  public inEdition = false;
  /**
   * buildingNumber observable
   * @internal
   */
  public buildingNumber$: BehaviorSubject<number> = new BehaviorSubject(undefined);

  /**
   * suffix observable
   * @internal
   */
  public suffix$: BehaviorSubject<number> = new BehaviorSubject(undefined);

  handleFormEdit(isClick: boolean) {
    this.submitted = true;
    if (isClick) {
      this.inEdition = true;
    }    else {
      this.inEdition = false;
    }
  }
  handleFormSave(isClick: boolean) {
    this.submitted = true;
    if (isClick) {
      this.inEdition = true;
    }    else {
      this.inEdition = false;
    }
  }
  handleFormCancel(isClick: boolean) {
    this.submitted = true;
    if (isClick) {
      this.inEdition = true;
    }    else {
      this.inEdition = false;
    }
  }
  constructor() {}

   /**
   * Toggle the clear buildingNumber and suffix
   * @internal
   */
  ngOnDestroy() {
    // todo
  }
}
