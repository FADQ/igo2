import { Injectable} from '@angular/core';

import { EntityTableTemplate, EntityTableColumnRenderer } from '@igo2/common';

import { formatDate } from 'src/lib/utils/date';
import { padClientNum } from '../../shared/client.utils';
import { ClientInfoService } from '../../info/shared/client-info.service';
import { ClientParcel } from './client-parcel.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClientParcelTableService {

  constructor(private clientInfoService: ClientInfoService) {}

  buildTable(): EntityTableTemplate {
    return {
      selection: true,
      selectionCheckbox: true,
      selectMany: true,
      sort: true,
      fixedHeader: true,
      headerClassFunc: (() => {
        return {'text-centered': true};
      }),
      rowClassFunc: ((parcel: ClientParcel) => {
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
          name: 'properties.noClientDetenteur',
          title: 'Autre détenteur',
          renderer: EntityTableColumnRenderer.UnsanitizedHTML,
          valueAccessor: (parcel: ClientParcel) => {
            const value = parcel.properties.noClientDetenteur;
            if (!value) { return ''; }
            if (value === parcel.properties.noClientRecherche) { return value; }
            return this.computeClientNumAnchor(value);
          }
        },
        {
          name: 'properties.noClientExploitant',
          title: 'Autre exploitant',
          renderer: EntityTableColumnRenderer.UnsanitizedHTML,
          valueAccessor: (parcel: ClientParcel) => {
            const value = parcel.properties.noClientExploitant;
            if (!value) { return ''; }
            if (value === parcel.properties.noClientRecherche) { return value; }
            return this.computeClientNumAnchor(value);
          }
        },
        {
          name: 'properties.infoLocateur',
          title: 'Information localisation'
        },
        {
          name: 'properties.production',
          title: 'Code de production'
        },
        {
          name: 'properties.descriptionProduction',
          title: 'Description de production'
        },
        {
          name: 'properties.superficie',
          title: 'Superficie mesurée (m²)'
        },
        {
          name: 'properties.superficieHectare',
          title: 'Superficie mesurée (ha)'
        },
        {
          name: 'properties.pourcentageSupMao',
          title: 'Superficie (%)'
        },
        {
          name: 'properties.superficieMao',
          title: 'Superficie mesurée selon % (ha)'
        },
        {
          name: 'properties.superficieDeclaree',
          title: 'Superficie déclarée IVEG (ha)'
        },
        {
          name: 'properties.codeDefaultCultural',
          title: 'Code de défaut cultural'
        },
        {
          name: 'properties.pourcentageDefautCultural',
          title: 'Pourcentage de défaut cultural'
        },
        {
          name: 'properties.noConfirmation',
          title: 'Numéro de confirmation IVEG'
        },
        {
          name: 'properties.statutAugmentationSupCultivable',
          title: 'Statut de déboisement'
        },
        {
          name: 'properties.parcelleDrainee',
          title: 'Drainage'
        },
        {
          name: 'properties.sourceParcelleAgricole',
          title: 'Référence de la mesure'
        },
        {
          name: 'properties.timbreMajGeometrie',
          title: 'Date de mise à jour',
          valueAccessor: (parcel: ClientParcel) => {
            const value = parcel.properties.timbreMajGeometrie;
            if (!value) { return ''; }
            return formatDate(value);
          }
        }
      ]
    };
  }

  private computeClientNumAnchor(clientNum: string): string {
    const link = this.clientInfoService.getClientInfoLink(padClientNum(clientNum));
    const onClick = `window.open('${link}', 'Client', 'width=800, height=600'); return false;`;
    return `<a target="popup" href="${link}" onClick="${onClick}">${clientNum}</a>`;
  }
}
