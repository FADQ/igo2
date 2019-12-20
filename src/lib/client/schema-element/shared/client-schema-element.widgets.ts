

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
  ClientSchemaElementTranslateComponent
} from '../client-schema-element-translate/client-schema-element-translate.component';
import {
  ClientSchemaElementImportComponent
} from '../client-schema-element-import/client-schema-element-import.component';

/** Create **/
export const ClientSchemaElementCreateWidget = new InjectionToken<Widget>('ClientSchemaElementCreateWidget');

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

/** Update **/
export function clientSchemaElementUpdateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaElementUpdateComponent);
}

export const ClientSchemaElementUpdateWidget = new InjectionToken<Widget>('ClientSchemaElementUpdateWidget');

export function provideClientSchemaElementUpdateWidget() {
  return {
    provide: ClientSchemaElementUpdateWidget,
    useFactory: clientSchemaElementUpdateWidgetFactory,
    deps: [WidgetService]
  };
}

/** Update Batch **/
export const ClientSchemaElementUpdateBatchWidget = new InjectionToken<Widget>('ClientSchemaElementUpdateBatchWidget');

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

/** Fill **/
export const ClientSchemaElementFillWidget = new InjectionToken<Widget>('ClientSchemaElementFillWidget');

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

/** Slice **/
export const ClientSchemaElementSliceWidget = new InjectionToken<Widget>('ClientSchemaElementSliceWidget');

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

/** Save **/
export const ClientSchemaElementSaveWidget = new InjectionToken<Widget>('ClientSchemaElementSaveWidget');

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

/** Translate **/
export const ClientSchemaElementTranslateWidget =
  new InjectionToken<Widget>('ClientSchemaElementTranslateWidget');

export function clientSchemaElementTranslateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaElementTranslateComponent);
}

export function provideClientSchemaElementTranslateWidget() {
  return {
    provide: ClientSchemaElementTranslateWidget,
    useFactory: clientSchemaElementTranslateWidgetFactory,
    deps: [WidgetService]
  };
}

/** Import **/
export const ClientSchemaElementImportWidget = new InjectionToken<Widget>('ClientSchemaElementImportWidget');

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
