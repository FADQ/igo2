import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import {
  ClientParcelTxReconciliateComponent
} from '../client-parcel-tx-reconciliate/client-parcel-tx-reconciliate.component';

/** Reconciliate **/
export const ClientParcelTxReconciliateWidget =
  new InjectionToken<Widget>('ClientParcelTxReconciliateWidget');

export function clientParcelTxReconciliateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelTxReconciliateComponent);
}

export function provideClientParcelTxReconciliateWidget() {
  return {
    provide: ClientParcelTxReconciliateWidget,
    useFactory: clientParcelTxReconciliateWidgetFactory,
    deps: [WidgetService]
  };
}
