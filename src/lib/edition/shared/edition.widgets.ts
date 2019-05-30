

import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import { EditionFormComponent } from '../edition-form/edition-form.component';
import { EditionSlicerComponent } from '../edition-slicer/edition-slicer.component';
import { EditionUndoComponent } from '../edition-undo/edition-undo.component';

// import {
//   EditionUpdateFormComponent
// } from '../edition-update-form/edition-update-form.component';
// import {
//   EditionReincludeFormComponent
// } from '../edition-reinclude-form/edition-reinclude-form.component';
// import {
//   EditionSliceFormComponent
// } from '../edition-slice-form/edition-slice-form.component';
// import {
//   EditionSaverComponent
// } from '../edition-saver/edition-saver.component';
// import {
//   EditionUndoComponent
// } from '../edition-undo/edition-undo.component';
// import {
//   EditionImportDataComponent
// } from '../edition-import-data/edition-import-data.component';

export const EditionFormWidget = new InjectionToken<Widget>('EditionFormWidget');
export const EditionSlicerWidget = new InjectionToken<Widget>('EditionSlicerWidget');
export const EditionUndoWidget = new InjectionToken<Widget>('EditionUndoWidget');

// export const EditionUpdateWidget = new InjectionToken<Widget>('EditionUpdateWidget');
// export const EditionReincludeWidget = new InjectionToken<Widget>('EditionReincludeWidget');
// export const EditionSliceWidget = new InjectionToken<Widget>('EditionSliceWidget');
// export const EditionSaverWidget = new InjectionToken<Widget>('EditionSaverWidget');
// export const EditionUndoWidget = new InjectionToken<Widget>('EditionUndoWidget');
// export const EditionImportDataWidget = new InjectionToken<Widget>('EditionImportDataWidget');

export function editionFormWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionFormComponent);
}

export function provideEditionFormWidget() {
  return {
    provide: EditionFormWidget,
    useFactory: editionFormWidgetFactory,
    deps: [WidgetService]
  };
}

export function editionSlicerWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionSlicerComponent);
}

export function provideEditionSlicerWidget() {
  return {
    provide: EditionSlicerWidget,
    useFactory: editionSlicerWidgetFactory,
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
/*
export function editionUpdateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionUpdateFormComponent);
}

export function provideEditionUpdateWidget() {
  return {
    provide: EditionUpdateWidget,
    useFactory: editionUpdateWidgetFactory,
    deps: [WidgetService]
  };
}

export function editionReincludeWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionReincludeFormComponent);
}

export function provideEditionReincludeWidget() {
  return {
    provide: EditionReincludeWidget,
    useFactory: editionReincludeWidgetFactory,
    deps: [WidgetService]
  };
}

export function editionSliceWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionSliceFormComponent);
}

export function provideEditionSliceWidget() {
  return {
    provide: EditionSliceWidget,
    useFactory: editionSliceWidgetFactory,
    deps: [WidgetService]
  };
}

export function editionSaverWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionSaverComponent);
}

export function provideEditionSaverWidget() {
  return {
    provide: EditionSaverWidget,
    useFactory: editionSaverWidgetFactory,
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

export function editionImportDataWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(EditionImportDataComponent);
}

export function provideEditionImportDataWidget() {
  return {
    provide: EditionImportDataWidget,
    useFactory: editionImportDataWidgetFactory,
    deps: [WidgetService]
  };
}
*/