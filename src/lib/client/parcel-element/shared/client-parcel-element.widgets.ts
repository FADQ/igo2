import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import {
  ClientParcelElementCreateComponent
} from '../client-parcel-element-create/client-parcel-element-create.component';
import {
  ClientParcelElementUpdateComponent
} from '../client-parcel-element-update/client-parcel-element-update.component';
import {
  ClientParcelElementUpdateBatchComponent
} from '../client-parcel-element-update-batch/client-parcel-element-update-batch.component';
import {
  ClientParcelElementFillComponent
} from '../client-parcel-element-fill/client-parcel-element-fill.component';
import {
  ClientParcelElementNumberingComponent
} from '../client-parcel-element-numbering/client-parcel-element-numbering.component';
import {
  ClientParcelElementReconciliateComponent
} from '../client-parcel-element-reconciliate/client-parcel-element-reconciliate.component';
import {
  ClientParcelElementSliceComponent
} from '../client-parcel-element-slice/client-parcel-element-slice.component';
import {
  ClientParcelElementSaveComponent
} from '../client-parcel-element-save/client-parcel-element-save.component';
import {
  ClientParcelElementImportComponent
} from '../client-parcel-element-import/client-parcel-element-import.component';
import {
  ClientParcelElementTransferComponent
} from '../client-parcel-element-transfer/client-parcel-element-transfer.component';

export const ClientParcelElementCreateWidget =
  new InjectionToken<Widget>('ClientParcelElementCreateWidget');
export const ClientParcelElementUpdateWidget =
  new InjectionToken<Widget>('ClientParcelElementUpdateWidget');
export const ClientParcelElementUpdateBatchWidget =
  new InjectionToken<Widget>('ClientParcelElementUpdateBatchWidget');
export const ClientParcelElementFillWidget =
  new InjectionToken<Widget>('ClientParcelElementFillWidget');
export const ClientParcelElementNumberingWidget =
  new InjectionToken<Widget>('ClientParcelElementNumberingWidget');
export const ClientParcelElementReconciliateWidget =
  new InjectionToken<Widget>('ClientParcelElementReconciliateWidget');
export const ClientParcelElementSliceWidget =
  new InjectionToken<Widget>('ClientParcelElementSliceWidget');
export const ClientParcelElementSaveWidget =
  new InjectionToken<Widget>('ClientParcelElementSaveWidget');
export const ClientParcelElementUndoWidget =
  new InjectionToken<Widget>('ClientParcelElementUndoWidget');
export const ClientParcelElementImportWidget =
  new InjectionToken<Widget>('ClientParcelElementImportWidget');
export const ClientParcelElementTransferWidget =
  new InjectionToken<Widget>('ClientParcelElementTransferWidget');

export function clientParcelElementCreateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementCreateComponent);
}

export function provideClientParcelElementCreateWidget() {
  return {
    provide: ClientParcelElementCreateWidget,
    useFactory: clientParcelElementCreateWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientParcelElementUpdateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementUpdateComponent);
}

export function provideClientParcelElementUpdateWidget() {
  return {
    provide: ClientParcelElementUpdateWidget,
    useFactory: clientParcelElementUpdateWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientParcelElementUpdateBatchWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementUpdateBatchComponent);
}

export function provideClientParcelElementUpdateBatchWidget() {
  return {
    provide: ClientParcelElementUpdateBatchWidget,
    useFactory: clientParcelElementUpdateBatchWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientParcelElementFillWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementFillComponent);
}

export function provideClientParcelElementFillWidget() {
  return {
    provide: ClientParcelElementFillWidget,
    useFactory: clientParcelElementFillWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientParcelElementNumberingWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementNumberingComponent);
}

export function provideClientParcelElementNumberingWidget() {
  return {
    provide: ClientParcelElementNumberingWidget,
    useFactory: clientParcelElementNumberingWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientParcelElementReconciliateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementReconciliateComponent);
}

export function provideClientParcelElementReconciliateWidget() {
  return {
    provide: ClientParcelElementReconciliateWidget,
    useFactory: clientParcelElementReconciliateWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientParcelElementSliceWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementSliceComponent);
}

export function provideClientParcelElementSliceWidget() {
  return {
    provide: ClientParcelElementSliceWidget,
    useFactory: clientParcelElementSliceWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientParcelElementSaveWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementSaveComponent);
}

export function provideClientParcelElementSaveWidget() {
  return {
    provide: ClientParcelElementSaveWidget,
    useFactory: clientParcelElementSaveWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientParcelElementImportWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementImportComponent);
}

export function provideClientParcelElementImportWidget() {
  return {
    provide: ClientParcelElementImportWidget,
    useFactory: clientParcelElementImportWidgetFactory,
    deps: [WidgetService]
  };
}

export function clientParcelElementTransferWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementTransferComponent);
}

export function provideClientParcelElementTransferWidget() {
  return {
    provide: ClientParcelElementTransferWidget,
    useFactory: clientParcelElementTransferWidgetFactory,
    deps: [WidgetService]
  };
}
