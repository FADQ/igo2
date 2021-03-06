

import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import { EditionUpsertComponent } from '../edition-upsert/edition-upsert.component';
import { EditionUpdateBatchComponent } from '../edition-update-batch/edition-update-batch.component';
import { EditionFillComponent } from '../edition-fill/edition-fill.component';
import { EditionImportComponent } from '../edition-import/edition-import.component';
import { EditionRedrawComponent } from '../edition-redraw/edition-redraw.component';
import { EditionSaveComponent } from '../edition-save/edition-save.component';
import { EditionSimplifyComponent } from '../edition-simplify/edition-simplify.component';
import { EditionSliceComponent } from '../edition-slice/edition-slice.component';
import { EditionTranslateComponent } from '../edition-translate/edition-translate.component';
import { EditionUndoComponent } from '../edition-undo/edition-undo.component';

/** Upsert **/
export const EditionUpsertWidget = new InjectionToken<Widget>('EditionUpsertWidget');

export function editionUpsertWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionUpsertComponent);
}

export function provideEditionUpsertWidget() {
  return {
    provide: EditionUpsertWidget,
    useFactory: editionUpsertWidgetFactory,
    deps: [WidgetService]
  };
}

/** Update Batch **/
export const EditionUpdateBatchWidget = new InjectionToken<Widget>('EditionUpdateBatchWidget');

export function editionUpdateBatchWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionUpdateBatchComponent);
}

export function provideEditionUpdateBatchWidget() {
  return {
    provide: EditionUpdateBatchWidget,
    useFactory: editionUpdateBatchWidgetFactory,
    deps: [WidgetService]
  };
}

/** Fill **/
export const EditionFillWidget = new InjectionToken<Widget>('EditionFillWidget');

export function editionFillWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionFillComponent);
}

export function provideEditionFillWidget() {
  return {
    provide: EditionFillWidget,
    useFactory: editionFillWidgetFactory,
    deps: [WidgetService]
  };
}

/** Import **/
export const EditionImportWidget = new InjectionToken<Widget>('EditionImportWidget');

export function editionImportWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionImportComponent);
}

export function provideEditionImportWidget() {
  return {
    provide: EditionImportWidget,
    useFactory: editionImportWidgetFactory,
    deps: [WidgetService]
  };
}

/** Redraw **/
export const EditionRedrawWidget = new InjectionToken<Widget>('EditionRedrawWidget');

export function editionRedrawWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionRedrawComponent);
}

export function provideEditionRedrawWidget() {
  return {
    provide: EditionRedrawWidget,
    useFactory: editionRedrawWidgetFactory,
    deps: [WidgetService]
  };
}

/** Save **/
export const EditionSaveWidget = new InjectionToken<Widget>('EditionSaveWidget');

export function editionSaveWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionSaveComponent);
}

export function provideEditionSaveWidget() {
  return {
    provide: EditionSaveWidget,
    useFactory: editionSaveWidgetFactory,
    deps: [WidgetService]
  };
}

/** Simplify **/
export const EditionSimplifyWidget = new InjectionToken<Widget>('EditionSimplifyWidget');

export function editionSimplifyWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionSimplifyComponent);
}

export function provideEditionSimplifyWidget() {
  return {
    provide: EditionSimplifyWidget,
    useFactory: editionSimplifyWidgetFactory,
    deps: [WidgetService]
  };
}

/** Slice **/
export const EditionSliceWidget = new InjectionToken<Widget>('EditionSliceWidget');

export function editionSliceWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionSliceComponent);
}

export function provideEditionSliceWidget() {
  return {
    provide: EditionSliceWidget,
    useFactory: editionSliceWidgetFactory,
    deps: [WidgetService]
  };
}

/** Translate **/
export const EditionTranslateWidget = new InjectionToken<Widget>('EditionTranslateWidget');

export function editionTranslateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionTranslateComponent);
}

export function provideEditionTranslateWidget() {
  return {
    provide: EditionTranslateWidget,
    useFactory: editionTranslateWidgetFactory,
    deps: [WidgetService]
  };
}

/** Undo **/
export const EditionUndoWidget = new InjectionToken<Widget>('EditionUndoWidget');

export function editionUndoWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionUndoComponent);
}

export function provideEditionUndoWidget() {
  return {
    provide: EditionUndoWidget,
    useFactory: editionUndoWidgetFactory,
    deps: [WidgetService]
  };
}
