import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import {
  ClientParcelElementStartTxComponent
} from '../client-parcel-element-start-tx/client-parcel-element-start-tx.component';
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
  ClientParcelElementRedrawComponent
} from '../client-parcel-element-redraw/client-parcel-element-redraw.component';
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
  ClientParcelElementSimplifyComponent
} from '../client-parcel-element-simplify/client-parcel-element-simplify.component';
import {
  ClientParcelElementSliceComponent
} from '../client-parcel-element-slice/client-parcel-element-slice.component';
import {
  ClientParcelElementSaveComponent
} from '../client-parcel-element-save/client-parcel-element-save.component';
import {
  ClientParcelElementTranslateComponent
} from '../client-parcel-element-translate/client-parcel-element-translate.component';
import {
  ClientParcelElementImportComponent
} from '../client-parcel-element-import/client-parcel-element-import.component';
import {
  ClientParcelElementTransferComponent
} from '../client-parcel-element-transfer/client-parcel-element-transfer.component';
import {
  ClientParcelElementWithoutOwnerComponent
} from '../client-parcel-element-without-owner/client-parcel-element-without-owner.component';

/** Start Tx **/
export function clientParcelElementStartTxWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementStartTxComponent);
}

export const ClientParcelElementStartTxWidget =
  new InjectionToken<Widget>('ClientParcelElementStartTxWidget');

export function provideClientParcelElementStartTxWidget() {
  return {
    provide: ClientParcelElementStartTxWidget,
    useFactory: clientParcelElementStartTxWidgetFactory,
    deps: [WidgetService]
  };
}

/** Create **/
export const ClientParcelElementCreateWidget =
  new InjectionToken<Widget>('ClientParcelElementCreateWidget');

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

/** Update **/
export const ClientParcelElementUpdateWidget =
  new InjectionToken<Widget>('ClientParcelElementUpdateWidget');

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

/** Update Batch **/
export const ClientParcelElementUpdateBatchWidget =
  new InjectionToken<Widget>('ClientParcelElementUpdateBatchWidget');

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

/** Redraw **/
export const ClientParcelElementRedrawWidget =
  new InjectionToken<Widget>('ClientParcelElementRedrawWidget');

export function clientParcelElementRedrawWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementRedrawComponent);
}

export function provideClientParcelElementRedrawWidget() {
  return {
    provide: ClientParcelElementRedrawWidget,
    useFactory: clientParcelElementRedrawWidgetFactory,
    deps: [WidgetService]
  };
}

/** Fill **/
export const ClientParcelElementFillWidget =
  new InjectionToken<Widget>('ClientParcelElementFillWidget');

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

/** Simplify **/
export const ClientParcelElementSimplifyWidget =
  new InjectionToken<Widget>('ClientParcelElementSimplifyWidget');

export function clientParcelElementSimplifyWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementSimplifyComponent);
}

export function provideClientParcelElementSimplifyWidget() {
  return {
    provide: ClientParcelElementSimplifyWidget,
    useFactory: clientParcelElementSimplifyWidgetFactory,
    deps: [WidgetService]
  };
}

/** Slice **/
export const ClientParcelElementSliceWidget =
  new InjectionToken<Widget>('ClientParcelElementSliceWidget');

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

/** Translate **/
export const ClientParcelElementTranslateWidget =
  new InjectionToken<Widget>('ClientParcelElementTranslateWidget');

export function clientParcelElementTranslateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementTranslateComponent);
}

export function provideClientParcelElementTranslateWidget() {
  return {
    provide: ClientParcelElementTranslateWidget,
    useFactory: clientParcelElementTranslateWidgetFactory,
    deps: [WidgetService]
  };
}

/** Numbering **/
export const ClientParcelElementNumberingWidget =
  new InjectionToken<Widget>('ClientParcelElementNumberingWidget');

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

/** Reconciliate **/
export const ClientParcelElementReconciliateWidget =
  new InjectionToken<Widget>('ClientParcelElementReconciliateWidget');

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

/** Save **/
export const ClientParcelElementSaveWidget =
  new InjectionToken<Widget>('ClientParcelElementSaveWidget');

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

/** Import **/
export const ClientParcelElementImportWidget =
  new InjectionToken<Widget>('ClientParcelElementImportWidget');

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

/** Transfer **/
export const ClientParcelElementTransferWidget =
  new InjectionToken<Widget>('ClientParcelElementTransferWidget');

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

/** Parcels without owner **/
export const ClientParcelElementWithoutOwnerWidget =
  new InjectionToken<Widget>('ClientParcelElementWithoutOwnerWidget');

export function clientParcelElementWithoutOwnerWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientParcelElementWithoutOwnerComponent);
}

export function provideClientParcelElementWithoutOwnerWidget() {
  return {
    provide: ClientParcelElementWithoutOwnerWidget,
    useFactory: clientParcelElementWithoutOwnerWidgetFactory,
    deps: [WidgetService]
  };
}
