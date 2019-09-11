import { Inject, Injectable} from '@angular/core';

import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Action, Widget } from '@igo2/common';

import {
  ClientController,
  ClientSchema,
  ClientSchemaType,
  ClientSchemaCreateWidget,
  ClientSchemaUpdateWidget,
  ClientSchemaDeleteWidget,
  ClientSchemaDuplicateWidget,
  ClientSchemaTransferWidget,
  ClientSchemaFileManagerWidget
} from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaActionsService {

  constructor(
    @Inject(ClientSchemaCreateWidget) private clientSchemaCreateWidget: Widget,
    @Inject(ClientSchemaUpdateWidget) private clientSchemaUpdateWidget: Widget,
    @Inject(ClientSchemaDeleteWidget) private clientSchemaDeleteWidget: Widget,
    @Inject(ClientSchemaDuplicateWidget) private clientSchemaDuplicateWidget: Widget,
    @Inject(ClientSchemaTransferWidget) private clientSchemaTransferWidget: Widget,
    @Inject(ClientSchemaFileManagerWidget) private clientSchemaFileManagerWidget: Widget
  ) {}

  buildActions(controller: ClientController): Action[] {

    function every(...observables: Observable<boolean>[]): Observable<boolean> {
      return combineLatest(observables).pipe(
        map((bunch: boolean[]) => bunch.every(Boolean))
      );
    }

    function noActiveWidget(ctrl: ClientController): Observable<boolean> {
      return ctrl.schemaWorkspace.widget$.pipe(
        map((widget: Widget) => widget === undefined)
      );
    }

    function schemaIsDefined(ctrl: ClientController): Observable<boolean> {
      return ctrl.schema$.pipe(
        map((schema: ClientSchema) => schema !== undefined)
      );
    }

    function schemaIsOfTypeLSE(ctrl: ClientController): Observable<boolean> {
      return ctrl.schema$.pipe(
        map((schema: ClientSchema) => schema !== undefined && schema.type === ClientSchemaType.LSE)
      );
    }

    function schemaCanBeDuplicated(ctrl: ClientController): Observable<boolean> {
      return ctrl.schema$.pipe(
        map((schema: ClientSchema) => schema !== undefined && schema.type !== ClientSchemaType.LSE)
      );
    }

    return [
      {
        id: 'create',
        icon: 'plus',
        title: 'client.schema.create',
        tooltip: 'client.schema.create.tooltip',
        args: [controller, this.clientSchemaCreateWidget],
        handler: function(ctrl: ClientController, widget: Widget) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        availability: noActiveWidget
      },
      {
        id: 'update',
        icon: 'pencil',
        title: 'client.schema.update',
        tooltip: 'client.schema.update.tooltip',
        args: [controller, this.clientSchemaUpdateWidget],
        handler: function(ctrl: ClientController, widget: Widget) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          schemaIsDefined(ctrl)
        )
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'client.schema.delete',
        tooltip: 'client.schema.delete.tooltip',
        args: [controller, this.clientSchemaDeleteWidget],
        handler: function(ctrl: ClientController, widget: Widget) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          schemaIsDefined(ctrl)
        )
      },
      {
        id: 'duplicate',
        icon: 'content-copy',
        title: 'client.schema.duplicate',
        tooltip: 'client.schema.duplicate.tooltip',
        args: [controller, this.clientSchemaDuplicateWidget],
        handler: function(ctrl: ClientController, widget: Widget) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          schemaCanBeDuplicated(ctrl)
        )
      },
      {
        id: 'manageFiles',
        icon: 'paperclip',
        title: 'client.schema.manageFiles',
        tooltip: 'client.schema.manageFiles.tooltip',
        args: [controller, this.clientSchemaFileManagerWidget],
        handler: function(widget: Widget, ctrl: ClientController) {
          ctrl.schemaWorkspace.activateWidget(widget, {schema: ctrl.schema}, {
            complete: (count: number) => {
              ctrl.schemaWorkspace.entityStore.update(Object.assign({}, ctrl.schema, {nbDocuments: count}));
            }
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          schemaIsDefined(ctrl)
        )
      },
      {
        id: 'transfer',
        icon: 'account-switch',
        title: 'client.schema.transfer',
        tooltip: 'client.schema.transfer.tooltip',
        args: [controller, this.clientSchemaTransferWidget],
        handler: function(ctrl: ClientController, widget: Widget) {
          ctrl.schemaWorkspace.activateWidget(widget, {
            client: ctrl.client,
            schema: ctrl.schema,
            store: ctrl.schemaWorkspace.entityStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          schemaIsOfTypeLSE(ctrl)
        )
      },
      // {
      //   id: 'createMap',
      //   icon: 'image',
      //   title: 'client.schema.createMap',
      //   tooltip: 'client.schema.createMap.tooltip',
      //   handler: function() {},
      //   availability: (ctrl: ClientController) => every(
      //     noActiveWidget(ctrl),
      //     schemaIsDefined(ctrl)
      //   )
      // }
    ];
  }

}
