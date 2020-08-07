import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnDestroy
} from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { FeatureStore } from '@igo2/geo';

import { ClientParcelPro } from '../shared/client-parcel-pro.interfaces';
import { getProduction, getProductionCategory } from '../shared/client-parcel-pro.utils';

interface ClientParcelProGroup {
  production: string;
  color: [number, number, number];
  parcels: ClientParcelPro[];
}

@Component({
  selector: 'fadq-client-parcel-pro-legend',
  templateUrl: './client-parcel-pro-legend.component.html',
  styleUrls: ['./client-parcel-pro-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelProLegendComponent implements OnInit, OnDestroy {

  readonly groups$: BehaviorSubject<ClientParcelProGroup[]> = new BehaviorSubject([]);

  private groups$$: Subscription;

  @Input() store: FeatureStore<ClientParcelPro>;

  constructor() {}

  ngOnInit() {
    this.groups$$ = this.store.view
      .all$()
      .subscribe((parcelPros: ClientParcelPro[]) => {
         const groups = this.computeParcelProGroups(parcelPros);
         this.groups$.next(groups);
      });
  }

  ngOnDestroy() {
    this.groups$$.unsubscribe();
  }

  getGroupOuterColor(group: ClientParcelProGroup): string {
    return 'rgb(' + group.color.join(', ') + ')';
  }

  getGroupInnerColor(group: ClientParcelProGroup): string {
    return 'rgba(' + group.color.join(', ') + ', 0.15)';
  }

  getGroupProDesc(group: ClientParcelProGroup): string {
    return getProduction(group.production).desc;
  }

  private computeParcelProGroups(parcelPros: ClientParcelPro[]): ClientParcelProGroup[] {
    const groupsByProduction: {[key: string]: ClientParcelProGroup} = {};
    for (let i = 0; i < parcelPros.length; i++) {
      const parcelPro = parcelPros[i];
      const production = parcelPro.properties['production'];
      const category = getProductionCategory(production);
      let group = groupsByProduction[production];
      if (group === undefined) {
        group = {
          production,
          color: category.color,
          parcels: []
        };
        groupsByProduction[production] = group;
      }

      group.parcels.push(parcelPro);
    }

    return Object.keys(groupsByProduction)
      .sort()
      .map((key: string) => groupsByProduction[key]);
  }

}
