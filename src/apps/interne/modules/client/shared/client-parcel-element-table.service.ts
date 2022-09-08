import { Injectable} from '@angular/core';

import {
  EntityTableTemplate,
  EntityTableColumnRenderer,
  FormFieldSelectChoice
} from '@igo2/common';
import { formatMeasure, squareMetersToHectares } from '@igo2/geo';

import { formatDate } from 'src/lib/utils/date';
import {
  ClientParcelElement,
  ClientParcelElementMessage,
  getParcelElementErrors,
  getParcelElementWarnings,
  getParcelDraineeChoices
} from 'src/lib/client';

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
      headerClassFunc: (() => {
        return {'text-centered': true};
      }),
      rowClassFunc: ((parcelElement: ClientParcelElement) => {
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
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const area = parcelElement.properties.superficie;
            return area ? formatMeasure(area, {decimal: 0, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieHectare',
          title: 'Superficie (ha)',
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const area = parcelElement.properties.superficie;
            return area ? formatMeasure(squareMetersToHectares(area), {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieAcre',
          title: 'Superficie (ac)',
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const area = parcelElement.properties.superficie;
            return area ? formatMeasure(squareMetersToHectares(area)*2.471, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.superficieArpent',
          title: 'Superficie (ar)',
          valueAccessor: (parcelElement: ClientParcelElement) => {
            const area = parcelElement.properties.superficie;
            return area ? formatMeasure(squareMetersToHectares(area)*2.924, {decimal: 1, locale: 'fr'}) : '';
          }
        },
        {
          name: 'properties.statutAugmentationSupCultivable',
          title: 'Statut IASC'
        },
        {
          name: 'properties.indParcelleDrainee',
          title: 'Parcelle drainée',
          valueAccessor: (parcelElement: ClientParcelElement) => {
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
          name: 'properties.sourceParcelleAgricole',
          title: 'Mesure déclarée'
        },
        {
          name: 'properties.timbreMaj',
          title: 'Date de mise à jour',
          valueAccessor: (parcelElement: ClientParcelElement) => {
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
          valueAccessor: (parcelElement: ClientParcelElement) => {
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
