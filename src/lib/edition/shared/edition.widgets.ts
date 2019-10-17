

import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import { EditionUpsertComponent } from '../edition-upsert/edition-upsert.component';
import { EditionUpdateBatchComponent } from '../edition-update-batch/edition-update-batch.component';
import { EditionFillComponent } from '../edition-fill/edition-fill.component';
import { EditionImportComponent } from '../edition-import/edition-import.component';
import { EditionRedrawComponent } from '../edition-redraw/edition-redraw.component';
import { EditionSaveComponent } from '../edition-save/edition-save.component';
import { EditionSliceComponent } from '../edition-slice/edition-slice.component';
import { EditionUndoComponent } from '../edition-undo/edition-undo.component';

export const EditionUpsertWidget = new InjectionToken<Widget>('EditionUpsertWidget');
export const EditionUpdateBatchWidget = new InjectionToken<Widget>('EditionUpdateBatchWidget');
export const EditionFillWidget = new InjectionToken<Widget>('EditionFillWidget');
export const EditionImportWidget = new InjectionToken<Widget>('EditionImportWidget');
export const EditionRedrawWidget = new InjectionToken<Widget>('EditionRedrawWidget');
export const EditionSaveWidget = new InjectionToken<Widget>('EditionSaveWidget');
export const EditionSliceWidget = new InjectionToken<Widget>('EditionSliceWidget');
export const EditionUndoWidget = new InjectionToken<Widget>('EditionUndoWidget');

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
