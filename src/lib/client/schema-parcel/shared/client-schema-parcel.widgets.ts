

import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import {
  ClientSchemaParcelTransferComponent
} from '../client-schema-parcel-transfer/client-schema-parcel-transfer.component';

export const ClientSchemaParcelTransferWidget = new InjectionToken<Widget>('ClientSchemaParcelTransferWidget');

export function clientSchemaParcelTransferWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaParcelTransferComponent);
}

export function provideClientSchemaParcelTransferWidget() {
  return {
    provide: ClientSchemaParcelTransferWidget,
    useFactory: clientSchemaParcelTransferWidgetFactory,
    deps: [WidgetService]
  };
}
