import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import {
  EntityTransaction
} from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

import { ClientParcelPro } from '../shared/client-parcel-pro.interfaces';

@Component({
  selector: 'fadq-client-parcel-pro-wizard',
  templateUrl: './client-parcel-pro-wizard.component.html',
  styleUrls: ['./client-parcel-pro-wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelProWizardComponent {

  readonly step$: BehaviorSubject<number> = new BehaviorSubject(undefined);

  /**
   * Parcel pro store
   */
  @Input() store: FeatureStore<ClientParcelPro>;

  /**
   * Parcel pro transaction
   */
  @Input() transaction: EntityTransaction;

  constructor() {}

  ngOnInit() {
    this.setStep(1);
  }

  setStep(step: number) {
    this.step$.next(step);
  }

}
