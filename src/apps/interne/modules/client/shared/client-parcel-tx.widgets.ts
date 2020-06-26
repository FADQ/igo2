import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import {
  ClientParcelTxStartComponent
} from '../client-parcel-tx-start/client-parcel-tx-start.component';

/** Start Tx **/
export function clientStartTxWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelTxStartComponent);
}

export const ClientParcelTxStartWidget =
  new InjectionToken<Widget>('ClientParcelTxStartWidget');

export function provideClientParcelTxStartWidget() {
  return {
    provide: ClientParcelTxStartWidget,
    useFactory: clientStartTxWidgetFactory,
    deps: [WidgetService]
  };
}
