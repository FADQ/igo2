

import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import {
  ClientSchemaParcelCreateFormComponent
} from '../client-schema-parcel-create-form/client-schema-parcel-create-form.component';
import {
  ClientSchemaParcelUpdateFormComponent
} from '../client-schema-parcel-update-form/client-schema-parcel-update-form.component';
import {
    ClientSchemaParcelTransferFormComponent
  } from '../client-schema-parcel-transfer-form/client-schema-parcel-transfer-form.component';

export const ClientSchemaParcelCreateWidget = new InjectionToken<Widget>('ClientSchemaParcelCreateWidget');
export const ClientSchemaParcelUpdateWidget = new InjectionToken<Widget>('ClientSchemaParcelUpdateWidget');
export const ClientSchemaParcelTransferFormWidget = new InjectionToken<Widget>('ClientSchemaParcelTransferFormWidget');

export function clientSchemaParcelCreateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaParcelCreateFormComponent);
}

export function provideClientSchemaParcelCreateWidget() {
  return {
    provide: ClientSchemaParcelCreateWidget,
    useFactory: clientSchemaParcelCreateWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientSchemaParcelUpdateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaParcelUpdateFormComponent);
}

export function provideClientSchemaParcelUpdateWidget() {
  return {
    provide: ClientSchemaParcelUpdateWidget,
    useFactory: clientSchemaParcelUpdateWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientSchemaParcelTransferFormWidgetFactory(widgetService: WidgetService) {
    return widgetService.create(ClientSchemaParcelTransferFormComponent);
  }

  export function provideClientSchemaParcelTransferFormWidget() {
    return {
      provide: ClientSchemaParcelTransferFormWidget,
      useFactory: clientSchemaParcelTransferFormWidgetFactory,
      deps: [WidgetService]
    };
  }
