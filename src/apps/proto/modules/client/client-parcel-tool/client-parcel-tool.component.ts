import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ToolComponent, EntityRecord, EntityTransaction } from '@igo2/common';
import { FeatureStore } from '@igo2/geo';

import { ClientParcelPro } from 'src/lib/client';
import { ClientState } from '../client.state';

/**
 * Tool edit parcel productions
 */
@ToolComponent({
  name: 'clientParcel',
  title: 'tools.client',
  icon: 'sprout'
})
@Component({
  selector: 'fadq-client-parcel-tool',
  templateUrl: './client-parcel-tool.component.html',
  styleUrls: ['./client-parcel-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelToolComponent {

  readonly parcelPros$: Observable<ClientParcelPro[]> = this.store.stateView
    .manyBy$((record: EntityRecord<ClientParcelPro>) => record.state.selected === true)
    .pipe(
      map((records: EntityRecord<ClientParcelPro>[]) => {
        console.log(records)
        return records.map((record: EntityRecord<ClientParcelPro>) => record.entity)
      })
    );

  get store(): FeatureStore<ClientParcelPro> { return this.clientState.controller.parcelStore; }
 
  get transaction(): EntityTransaction { return this.clientState.controller.parcelWorkspace.transaction; }

  constructor(
    private clientState: ClientState
  ) {}

  onComplete() {
    console.log('complete')
  }

  onCancel() {
    console.log('cancel')
  }

}
