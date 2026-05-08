import { Injectable} from '@angular/core';

import { EntityTableTemplate, EntityTableColumnRenderer } from '@igo2/common/entity';
import { FormFieldSelectChoice } from '@igo2/common/form';
import { formatMeasure, squareMetersToHectares } from '@igo2/geo';

import { formatDate } from 'src/lib/utils/date';
import {
  ClientParcelElement,
  ClientParcelElementMessage,
  getParcelElementErrors,
  getParcelElementWarnings,
  getParcelDraineeChoices
} from 'src/lib/client';
import { typedRowClass } from '@lib/compatibility/typedAccessor';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelElementTableService {

  buildTable(): EntityTableTemplate {
    // TODO: i18n
    return {
      selection: true,
      selectionCheckbox: true,
      selectMany: true,
      sort: true,
      tableHeight: '100%',
      headerClassFunc: (() => {
        return {'text-centered': true};
      }),
      rowClassFunc: typedRowClass<ClientParcelElement>(() => {
        return {'text-centered': true};
      }),
      columns: [
        {
          name: 'properties.noParcelleAgricole',
          title: 'Numéro de parcelle'
        },
        {
          name: 'properties.noDiagramme',
          title: 'Numéro de diagramme'
        },
        {
          name: 'properties.superficie',
          title: 'Superficie (m²)',
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcelElement;
            const area = parcelElement.properties.superficie;
            return area ? formatMeasure(area, {decimal: 0, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieHectare',
          title: 'Superficie (ha)',
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcelElement;
            const area = parcelElement.properties.superficie;
            return area ? formatMeasure(squareMetersToHectares(area), {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieAcre',
          title: 'Superficie (ac)',
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcelElement;
            const area = Number(squareMetersToHectares(parcelElement.properties.superficie).toFixed(1));
            return area ? formatMeasure(area*2.471, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieArpent',
          title: 'Superficie (ar)',
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcelElement;
            const area = Number(squareMetersToHectares(parcelElement.properties.superficie).toFixed(1));
            return area ? formatMeasure(area*2.924, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.statutAugmentationSupCultivable',
          title: 'Statut IASC'
        },
        {
          name: 'properties.indParcelleDrainee',
          title: 'Parcelle drainée',
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcelElement;
            const value = parcelElement.properties.indParcelleDrainee;
            const choices = getParcelDraineeChoices();
            const choice = choices.find((_choice: FormFieldSelectChoice) => _choice.value === value);
            return choice ? choice.title : '';
          }
        },
        {
          name: 'properties.infoLocateur',
          title: 'Information localisation'
        },
        {
          name: 'properties.anneeImage',
          title: 'Année de l’image du mesurage'
        },
        {
          name: 'properties.descSourceParcelleAgricole',
          title: 'Mesure déclarée'
        },
        {
          name: 'properties.timbreMaj',
          title: 'Date de mise à jour',
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcelElement;
            const value = parcelElement.properties.timbreMaj;
            if (!value) { return ''; }
            return formatDate(value);
          }
        },
        {
          name: 'properties.usagerMaj',
          title: 'Utilisateur'
        },
        {
          name: 'properties.exploitantTran',
          title: 'Exploitant de transfert'
        },
        {
          name: 'properties.messages',
          title: 'Validation',
          renderer: EntityTableColumnRenderer.UnsanitizedHTML,
          valueAccessor: (entity: Object) => {
            const parcelElement = entity as ClientParcelElement;
            const errors = getParcelElementErrors(parcelElement);
            const warnings = getParcelElementWarnings(parcelElement);
            const errorsHtml = errors.map((error: ClientParcelElementMessage) => {
              return `<span class="error-text" tooltip="${error.libelle}">${error.id}</span>`;
            });
            const warningsHtml = warnings.map((warning: ClientParcelElementMessage) => {
              return `<span class="warning-text" tooltip="${warning.libelle}">${warning.id}</span>`;
            });
            return [...errorsHtml, ...warningsHtml].join(', ');
          },
          cellClassFunc: () => ({'overflow-inherit': true})
        }
      ]
    };
  }
}
