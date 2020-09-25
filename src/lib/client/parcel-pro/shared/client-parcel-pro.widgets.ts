import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import {
  ClientParcelProUpdateBatchComponent
} from '../client-parcel-pro-update-batch/client-parcel-pro-update-batch.component';

/** Update Batch **/
export const ClientParcelProUpdateBatchWidget =
  new InjectionToken<Widget>('ClientParcelProUpdateBatchWidget');

export function clientParcelProUpdateBatchWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelProUpdateBatchComponent);
}

export function provideClientParcelProUpdateBatchWidget() {
  return {
    provide: ClientParcelProUpdateBatchWidget,
    useFactory: clientParcelProUpdateBatchWidgetFactory,
    deps: [WidgetService]
  };
}
