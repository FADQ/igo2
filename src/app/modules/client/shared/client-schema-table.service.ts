import { Injectable} from '@angular/core';

import { EntityTableTemplate } from '@igo2/common';

import { formatDate } from 'src/lib/utils/date';
import { ClientSchema } from 'src/lib/client';

@Injectable({
  providedIn: 'root'
})
export class ClientSchemaTableService {

  constructor() {}

  buildTable(): EntityTableTemplate {
    return {
      selection: true,
      sort: true,
      fixedHeader: true,
      headerClassFunc: (() => {
        return {'text-centered': true};
      }),
      rowClassFunc: ((schema: ClientSchema) => {
        return {'text-centered': true};
      }),
      columns: [
        {
          name: 'id',
          title: 'Numéro de schéma'
        },
        {
          name: 'descriptionType',
          title: 'Type de schéma'
        },
        {
          name: 'description',
          title: 'Description'
        },
        {
          name: 'annee',
          title: 'Année'
        },
        {
          name: 'timbreMaj.date',
          title: 'Date de mise à jour',
          valueAccessor: (schema: ClientSchema) => {
            const value = schema.timbreMaj.date;
            if (!value) { return ''; }
            return formatDate(value);
          }
        },
        {
          name: 'usagerMaj',
          title: 'Usager mise à jour'
        },
        {
          name: 'nbDocuments',
          title: 'Fichiers joints'
        }
      ]
    };
  }
}
