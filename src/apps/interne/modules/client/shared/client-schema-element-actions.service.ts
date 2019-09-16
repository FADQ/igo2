import { Inject, Injectable } from '@angular/core';

import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import { Action, EntityTableColumn, Widget } from '@igo2/common';
import { entitiesToRowData, exportToCSV } from '@igo2/geo';

import { EditionUndoWidget } from 'src/lib/edition';

import {
  ClientController,
  ClientSchemaElement,
  ClientSchemaElementCreateWidget,
  ClientSchemaElementUpdateWidget,
  ClientSchemaElementUpdateBatchWidget,
  ClientSchemaElementFillWidget,
  ClientSchemaElementSliceWidget,
  ClientSchemaElementSaveWidget,
  ClientSchemaElementImportWidget,
  generateSchemaElementOperationTitle
} from 'src/lib/client';

import { moveToFeatureStore } from 'src/apps/shared/modules/feature/shared/feature.utils';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaElementActionsService {

  constructor(
    @Inject(ClientSchemaElementCreateWidget) private clientSchemaElementCreateWidget: Widget,
    @Inject(ClientSchemaElementUpdateWidget) private clientSchemaElementUpdateWidget: Widget,
    @Inject(ClientSchemaElementUpdateBatchWidget) private clientSchemaElementUpdateBatchWidget: Widget,
    @Inject(ClientSchemaElementFillWidget) private clientSchemaElementFillWidget: Widget,
    @Inject(ClientSchemaElementSliceWidget) private clientSchemaElementSliceWidget: Widget,
    @Inject(ClientSchemaElementSaveWidget) private clientSchemaElementSaveWidget: Widget,
    @Inject(EditionUndoWidget) private editionUndoWidget: Widget,
    @Inject(ClientSchemaElementImportWidget) private clientSchemaElementImportWidget: Widget,
    private languageService: LanguageService
  ) {}

  buildActions(controller: ClientController): Action[] {

    function every(...observables: Observable<boolean>[]): Observable<boolean> {
      return combineLatest(observables).pipe(
        map((bunch: boolean[]) => bunch.every(Boolean))
      );
    }

    function noActiveWidget(ctrl: ClientController): Observable<boolean> {
      return ctrl.schemaElementWorkspace.widget$.pipe(
        map((widget: Widget) => widget === undefined)
      );
    }

    function oneSchemaElementIsActive(ctrl: ClientController): Observable<boolean> {
      return ctrl.selectedSchemaElements$.pipe(
        map((schemaElements: ClientSchemaElement[]) => schemaElements.length === 1)
      );
    }

    function oneOrMoreSchemaElementAreSelected(ctrl: ClientController): Observable<boolean> {
      return ctrl.selectedSchemaElements$.pipe(
        map((schemaElements: ClientSchemaElement[]) => schemaElements.length > 0)
      );
    }

    function transactionIsNotEmpty(ctrl: ClientController): Observable<boolean> {
      return ctrl.schemaElementTransaction.empty$.pipe(
        map((empty: boolean) => !empty)
      );
    }

    function transactionIsNotInCommitPhase(ctrl: ClientController): Observable<boolean> {
      return ctrl.schemaElementTransaction.inCommitPhase$.pipe(
        map((inCommitPhase: boolean) => !inCommitPhase)
      );
    }

    function schemaElementCanBeFilled(ctrl: ClientController): Observable<boolean> {
      return ctrl.selectedSchemaElements$.pipe(
        map(() => {
          const schemaElement = ctrl.activeSchemaElement;
          const geometry = schemaElement === undefined ? undefined : schemaElement.geometry;
          return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length > 1;
        })
      );
    }

    function schemaElementCanBeSliced(ctrl: ClientController): Observable<boolean> {
      return ctrl.selectedSchemaElements$.pipe(
        map(() => {
          const schemaElement = ctrl.activeSchemaElement;
          const geometry = schemaElement === undefined ? undefined : schemaElement.geometry;
          return geometry !== undefined && geometry.type === 'Polygon' && geometry.coordinates.length === 1;
        })
      );
    }

    return [
      {
        id: 'zoom-to-features',
        icon: 'feature-search-outline',
        title: 'map.moveToFeatures.title',
        tooltip: 'map.moveToFeatures.tooltip',
        args: [controller],
        handler: function(ctrl: ClientController) {
          moveToFeatureStore(
            ctrl.schemaElementWorkspace.map,
            ctrl.schemaElementWorkspace.schemaElementStore
          );
        },
        ngClass: (ctrl: ClientController) => of({
          'fadq-actionbar-item-divider': true
        })
      },
      {
        id: 'create',
        icon: 'plus',
        title: 'edition.create',
        tooltip: 'edition.create.tooltip',
        args: [controller, this.clientSchemaElementCreateWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          });
        },
        availability: noActiveWidget
      },
      {
        id: 'update',
        icon: 'pencil',
        title: 'edition.update',
        tooltip: 'edition.update.tooltip',
        args: [
          controller,
          this.clientSchemaElementUpdateWidget,
          this.clientSchemaElementUpdateBatchWidget
        ],
        handler: (ctrl: ClientController, singleWidget: Widget, batchWidget: Widget) => {
          const inputs = {
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          };

          if (ctrl.activeSchemaElement !== undefined) {
            ctrl.schemaElementWorkspace.activateWidget(singleWidget, Object.assign({
              schemaElement: ctrl.activeSchemaElement
            }, inputs));
          } else {
            ctrl.schemaElementWorkspace.activateWidget(batchWidget, Object.assign({
              schemaElements: ctrl.selectedSchemaElements
            }, inputs));
          }
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          oneOrMoreSchemaElementAreSelected(ctrl),
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'edition.delete',
        tooltip: 'edition.delete.tooltip',
        args: [controller],
        handler: (ctrl: ClientController) => {
          const store = ctrl.schemaElementStore;
          const transaction = ctrl.schemaElementTransaction;
          const schemaElements = ctrl.selectedSchemaElements;
          schemaElements.forEach((schemaElement: ClientSchemaElement) => {
            transaction.delete(schemaElement, store, {
              title: generateSchemaElementOperationTitle(schemaElement, this.languageService)
            });
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          oneOrMoreSchemaElementAreSelected(ctrl),
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'fill',
        icon: 'select-all',
        title: 'edition.fill',
        tooltip: 'edition.fill.tooltip',
        args: [controller, this.clientSchemaElementFillWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: ctrl.activeSchemaElement,
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          oneSchemaElementIsActive(ctrl),
          transactionIsNotInCommitPhase(ctrl),
          schemaElementCanBeFilled(ctrl)
        )
      },
      {
        id: 'slice',
        icon: 'box-cutter',
        title: 'edition.slice',
        tooltip: 'edition.slice.tooltip',
        args: [controller, this.clientSchemaElementSliceWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: ctrl.activeSchemaElement,
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          oneSchemaElementIsActive(ctrl),
          transactionIsNotInCommitPhase(ctrl),
          schemaElementCanBeSliced(ctrl)
        ),
        ngClass: (ctrl: ClientController) => of({
          'fadq-actionbar-item-divider': true
        })
      },
      {
        id: 'import',
        icon: 'import',
        title: 'client.schemaElement.import',
        tooltip: 'client.schemaElement.import.tooltip',
        args: [controller, this.clientSchemaElementImportWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schemaElement: ctrl.activeSchemaElement,
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          transactionIsNotInCommitPhase(ctrl)
        )
      },
      {
        id: 'export',
        icon: 'file-download',
        title: 'edition.exportToCSV',
        tooltip: 'edition.exportToCSV.tooltip',
        args: [controller],
        handler: (ctrl: ClientController) => {
          const workspace = ctrl.schemaElementWorkspace;
          const columns = workspace.meta.tableTemplate.columns;
          const headers = columns.map((column: EntityTableColumn) => column.title);
          const rows = entitiesToRowData(workspace.entityStore.view.all(), columns);

          const fileName = `Éléments du schéma ${ctrl.schema.id}.csv`;
          exportToCSV([headers].concat(rows), fileName, ';');
        },
        availability: noActiveWidget,
        ngClass: (ctrl: ClientController) => of({
          'fadq-actionbar-item-divider': true
        })
      },
      {
        id: 'save',
        icon: 'floppy',
        title: 'edition.save',
        tooltip: 'edition.save.tooltip',
        args: [controller, this.clientSchemaElementSaveWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            store: ctrl.schemaElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          transactionIsNotInCommitPhase(ctrl),
          transactionIsNotEmpty(ctrl)
        )
      },
      {
        id: 'undo',
        icon: 'undo',
        title: 'edition.undo',
        tooltip: 'edition.undo.tooltip',
        args: [controller, this.editionUndoWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            transaction: ctrl.schemaElementTransaction
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          transactionIsNotInCommitPhase(ctrl),
          transactionIsNotEmpty(ctrl)
        )
      }
    ];
  }

}
