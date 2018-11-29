import { Editor } from 'src/app/modules/edition';
import { EntityStore, EntityTableModel } from 'src/app/modules/entity';
import { Widget } from 'src/app/modules/widget';

import { ClientParcel } from './client.interface';

export class ClientParcelEditor extends Editor {

  static tableModel: EntityTableModel = {
    selection: true,
    sort: true,
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
        name: 'properties.codeProduction',
        title: 'Code de production'
      },
      {
        name: 'properties.descriptionCodeProduction',
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
        name: 'properties.pourcentageSuperficieMAO',
        title: 'Superficie (%)'
      },
      {
        name: 'properties.superficieMAO',
        title: 'Superficie (ha)'
      },
      {
        name: 'properties.superficieDeclaree',
        title: 'Superficie déclarée'
      },
      {
        name: 'properties.codeDefaultCultural',
        title: 'Code de défaut cultural'
      },
      {
        name: 'properties.pourcentageDefaultCultural',
        title: 'Pourcentage de défaut cultural'
      },
      {
        name: 'properties.noConfirmation',
        title: 'Numéro de confirmation IVEG'
      },
      {
        name: 'properties.noClient', // TODO: compute properly
        title: 'Détenteur'
      },
      {
        name: 'properties.noClientExploitant', // TODO: compute properly
        title: 'Exploitant'
      },
      {
        name: 'properties.statutAugmSuperficieCulture',
        title: 'Statut de déboisement'
      },
      {
        name: 'properties.indicateurParcelleDrainee',
        title: 'Drainage'
      },
      {
        name: 'properties.sourceParcelleAgricole',
        title: 'Source parcelle agricole'
      },
      // TODO: complete
    ]
  };

  constructor() {
    super({
      id: 'fadq.client-parcel-editor',
      title: 'Parcelles du client',
      tableModel: ClientParcelEditor.tableModel
    });

    this.bindEntityStore(new EntityStore<ClientParcel>());
    this.bindWidgetStore(new EntityStore<Widget>());
  }
}
