

import { InjectionToken } from '@angular/core';

import { Widget, WidgetService } from '@igo2/common';

import { ClientSchemaFileManagerComponent } from '../../schema-file/client-schema-file-manager/client-schema-file-manager.component';
import { ClientSchemaCreateComponent } from '../client-schema-create/client-schema-create.component';
import { ClientSchemaUpdateComponent } from '../client-schema-update/client-schema-update.component';
import { ClientSchemaDeleteComponent } from '../client-schema-delete/client-schema-delete.component';
import { ClientSchemaDuplicateComponent } from '../client-schema-duplicate/client-schema-duplicate.component';
import { ClientSchemaTransferComponent } from '../client-schema-transfer/client-schema-transfer.component';

/** Create **/
export const ClientSchemaCreateWidget = new InjectionToken<Widget>('ClientSchemaCreateWidget');

export function clientSchemaCreateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaCreateComponent);
}

export function provideClientSchemaCreateWidget() {
  return {
    provide:  ClientSchemaCreateWidget,
    useFactory: clientSchemaCreateWidgetFactory,
    deps: [WidgetService]
  };
}

/** Update **/
export const ClientSchemaUpdateWidget = new InjectionToken<Widget>('ClientSchemaUpdateWidget');

export function clientSchemaUpdateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaUpdateComponent);
}

export function provideClientSchemaUpdateWidget() {
  return {
    provide:  ClientSchemaUpdateWidget,
    useFactory: clientSchemaUpdateWidgetFactory,
    deps: [WidgetService]
  };
}

/** Delete **/
export const ClientSchemaDeleteWidget = new InjectionToken<Widget>('ClientSchemaDeleteeWidget');

export function clientSchemaDeleteWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaDeleteComponent);
}

export function provideClientSchemaDeleteWidget() {
  return {
    provide:  ClientSchemaDeleteWidget,
    useFactory: clientSchemaDeleteWidgetFactory,
    deps: [WidgetService]
  };
}

/** Duplicate **/
export const ClientSchemaDuplicateWidget = new InjectionToken<Widget>('ClientSchemaDuplicateWidget');

export function clientSchemaDuplicateWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaDuplicateComponent);
}

export function provideClientSchemaDuplicateWidget() {
  return {
    provide:  ClientSchemaDuplicateWidget,
    useFactory: clientSchemaDuplicateWidgetFactory,
    deps: [WidgetService]
  };
}

/** Transfer **/
export const ClientSchemaTransferWidget = new InjectionToken<Widget>('ClientSchemaTransferWidget');

export function clientSchemaTransferWidgetFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaTransferComponent);
}

export function provideClientSchemaTransferWidget() {
  return {
    provide:  ClientSchemaTransferWidget,
    useFactory: clientSchemaTransferWidgetFactory,
    deps: [WidgetService]
  };
}

/** File Manager **/
export const ClientSchemaFileManagerWidget = new InjectionToken<Widget>('ClientSchemaFileManagerWidget');

export function clientSchemaFileManagerFactory(widgetService: WidgetService) {
  return widgetService.create(ClientSchemaFileManagerComponent);
}

export function provideClientSchemaFileManagerWidget() {
  return {
    provide:  ClientSchemaFileManagerWidget,
    useFactory: clientSchemaFileManagerFactory,
    deps: [WidgetService]
  };
}
