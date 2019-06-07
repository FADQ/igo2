

import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import {
  ClientSchemaElementCreateComponent
} from '../client-schema-element-create/client-schema-element-create.component';
import {
  ClientSchemaElementUpdateComponent
} from '../client-schema-element-update/client-schema-element-update.component';
import {
  ClientSchemaElementUpdateBatchComponent
} from '../client-schema-element-update-batch/client-schema-element-update-batch.component';
import {
  ClientSchemaElementFillComponent
} from '../client-schema-element-fill/client-schema-element-fill.component';
import {
  ClientSchemaElementSliceComponent
} from '../client-schema-element-slice/client-schema-element-slice.component';
import {
  ClientSchemaElementSaveComponent
} from '../client-schema-element-save/client-schema-element-save.component';
import {
  ClientSchemaElementImportComponent
} from '../client-schema-element-import/client-schema-element-import.component';

export const ClientSchemaElementCreateWidget = new InjectionToken<Widget>('ClientSchemaElementCreateWidget');
export const ClientSchemaElementUpdateWidget = new InjectionToken<Widget>('ClientSchemaElementUpdateWidget');
export const ClientSchemaElementUpdateBatchWidget = new InjectionToken<Widget>('ClientSchemaElementUpdateBatchWidget');
export const ClientSchemaElementFillWidget = new InjectionToken<Widget>('ClientSchemaElementFillWidget');
export const ClientSchemaElementSliceWidget = new InjectionToken<Widget>('ClientSchemaElementSliceWidget');
export const ClientSchemaElementSaveWidget = new InjectionToken<Widget>('ClientSchemaElementSaveWidget');
export const ClientSchemaElementUndoWidget = new InjectionToken<Widget>('ClientSchemaElementUndoWidget');
export const ClientSchemaElementImportWidget = new InjectionToken<Widget>('ClientSchemaElementImportWidget');

export function clientSchemaElementCreateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaElementCreateComponent);
}

export function provideClientSchemaElementCreateWidget() {
  return {
    provide: ClientSchemaElementCreateWidget,
    useFactory: clientSchemaElementCreateWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientSchemaElementUpdateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaElementUpdateComponent);
}

export function provideClientSchemaElementUpdateWidget() {
  return {
    provide: ClientSchemaElementUpdateWidget,
    useFactory: clientSchemaElementUpdateWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientSchemaElementUpdateBatchWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaElementUpdateBatchComponent);
}

export function provideClientSchemaElementUpdateBatchWidget() {
  return {
    provide: ClientSchemaElementUpdateBatchWidget,
    useFactory: clientSchemaElementUpdateBatchWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientSchemaElementFillWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaElementFillComponent);
}

export function provideClientSchemaElementFillWidget() {
  return {
    provide: ClientSchemaElementFillWidget,
    useFactory: clientSchemaElementFillWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientSchemaElementSliceWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaElementSliceComponent);
}

export function provideClientSchemaElementSliceWidget() {
  return {
    provide: ClientSchemaElementSliceWidget,
    useFactory: clientSchemaElementSliceWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientSchemaElementSaveWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaElementSaveComponent);
}

export function provideClientSchemaElementSaveWidget() {
  return {
    provide: ClientSchemaElementSaveWidget,
    useFactory: clientSchemaElementSaveWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientSchemaElementImportWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaElementImportComponent);
}

export function provideClientSchemaElementImportWidget() {
  return {
    provide: ClientSchemaElementImportWidget,
    useFactory: clientSchemaElementImportWidgetFactory,
    deps: [WidgetService]
  };
}
