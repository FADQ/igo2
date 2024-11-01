import { Inject, Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  Action,
  EntityStoreFilterSelectionStrategy,
  EntityTableColumn,
  Widget
} from '@igo2/common';
import { entitiesToRowData, exportToCSV } from '@igo2/geo';
import { downloadFromUri } from '@igo2/utils';

import { EditionUndoWidget } from 'src/lib/edition';
import { every } from 'src/lib/utils';

import {
  ClientSchema,
  ClientSchemaService,
  ClientSchemaType,
  ClientSchemaElement,
  ClientSchemaElementCreateWidget,
  ClientSchemaElementUpdateWidget,
  ClientSchemaElementUpdateBatchWidget,
  ClientSchemaElementFillWidget,
  ClientSchemaElementSliceWidget,
  ClientSchemaElementSaveWidget,
  ClientSchemaElementTranslateWidget,
  ClientSchemaElementImportWidget,
  generateSchemaElementOperationTitle
} from 'src/lib/client';
import { moveToFeatureStore } from 'src/lib/feature';

import { ClientController } from './client-controller';

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
    @Inject(ClientSchemaElementTranslateWidget) private clientSchemaElementTranslateWidget: Widget,
    @Inject(ClientSchemaElementSaveWidget) private clientSchemaElementSaveWidget: Widget,
    @Inject(EditionUndoWidget) private editionUndoWidget: Widget,
    @Inject(ClientSchemaElementImportWidget) private clientSchemaElementImportWidget: Widget,
    private clientSchemaService: ClientSchemaService,
    private languageService: LanguageService
  ) {}

  /**
   * Load a controller's schema element workspace actions
   * @param controller Client controller
   */
  loadActions(controller: ClientController) {
    const actions = this.buildActions(controller);
    controller.schemaElementWorkspace.actionStore.load(actions);
  }

  /**
   * Create actions
   * @param controller Client controller
   * @returns Actions
   */
  private buildActions(controller: ClientController): Action[] {
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
        }
      },
      {
        id: 'filterSelection',
        icon: 'selection',
        title: 'map.filterSelection.title',
        tooltip: 'map.filterSelection.tooltip',
        args: [controller],
        handler: function(ctrl: ClientController) {
          const filterStrategy = ctrl.schemaElementStore
            .getStrategyOfType(EntityStoreFilterSelectionStrategy);
          if (filterStrategy.active) {
            filterStrategy.deactivate();
          } else {
            filterStrategy.activate();
          }
        },
        ngClass: function(ctrl: ClientController) {
          const filterStrategy = ctrl.schemaElementStore
            .getStrategyOfType(EntityStoreFilterSelectionStrategy);
          return filterStrategy.active$.pipe(
            map((active: boolean) => ({
              'fadq-actionbar-item-divider': true,
              'active-accent': active
            }))
          );
        }
      },
      {
        id: 'createUpdate',
        icon: 'pencil',
        title: 'edition.createUpdate',
        tooltip: 'edition.createUpdate.tooltip',
        args: [
          controller,
          this.clientSchemaElementCreateWidget,
          this.clientSchemaElementUpdateWidget,
          this.clientSchemaElementUpdateBatchWidget
        ],
        handler: (
          ctrl: ClientController,
          createWidget: Widget,
          singleWidget: Widget,
          batchWidget: Widget
        ) => {
          const inputs = {
            schema: ctrl.schema,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          };

          if (ctrl.selectedSchemaElements.length === 0) {
            ctrl.schemaElementWorkspace.activateWidget(createWidget, inputs);
          } else if (ctrl.activeSchemaElement !== undefined) {
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
          transactionIsNotInCommitPhase(ctrl),
          schemaElementHasSameGeometryType(ctrl)
        )
      },
      {
        id: 'translate',
        icon: 'pan',
        title: 'edition.translate',
        tooltip: 'edition.translate.tooltip',
        args: [controller, this.clientSchemaElementTranslateWidget],
        handler: (ctrl: ClientController, widget: Widget) => {
          ctrl.schemaElementWorkspace.activateWidget(widget, {
            schema: ctrl.schema,
            schemaElement: ctrl.activeSchemaElement,
            transaction: ctrl.schemaElementTransaction,
            map: ctrl.map,
            store: ctrl.schemaElementStore
          });
        },
        availability: (ctrl: ClientController) => every(
          noActiveWidget(ctrl),
          oneSchemaElementIsActive(ctrl),
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
      },
      {
        id: 'downloadMapLSE',
        icon: 'image-area-close',
        title: 'client.schemaElement.downloadMapLSE',
        tooltip: 'client.schemaElement.downloadMapLSE.tooltip',
        args: [controller],
        handler: (ctrl: ClientController) => {
          const url = this.clientSchemaService.getDownloadMapLSEUrl(ctrl.client);
          const fileName = 'structures_entreposage.zip';
          downloadFromUri(url, fileName);
        },
        availability: (ctrl: ClientController) => every(
          schemaIsOfTypeLSE(ctrl),
          atLeastOneSchemaElement(ctrl),
          transactionIsEmpty(ctrl)
        )
      }
    ];
  }

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

/**
 * Schemas element has same geometry type
 * @param ctrl Client controller
 * @returns return true if geometry type is unique. False otherwise. 
 */
function schemaElementHasSameGeometryType(ctrl: ClientController): Observable<boolean> {
  return ctrl.selectedSchemaElements$.pipe(
    map(() => {
      let typeIsUnique = true;
      let geometryType;

      ctrl.selectedSchemaElements.forEach((elem: ClientSchemaElement) => {
        if (geometryType === undefined)
          { geometryType = elem.geometry.type; }
        if (geometryType !== elem.geometry.type)
          { typeIsUnique = false; }
      });
      return typeIsUnique;
    })
  );
}

function transactionIsEmpty(ctrl: ClientController): Observable<boolean> {
  return ctrl.schemaElementTransaction.empty$;
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

function schemaIsOfTypeLSE(ctrl: ClientController): Observable<boolean> {
  return ctrl.schema$.pipe(
    map((schema: ClientSchema) => schema !== undefined && schema.type === ClientSchemaType.LSE)
  );
}

function atLeastOneSchemaElement(ctrl: ClientController): Observable<boolean> {
  return ctrl.schemaElementStore.empty$.pipe(
    map((empty: boolean) => !empty)
  );
}
