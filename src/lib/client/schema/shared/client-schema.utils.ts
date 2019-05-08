import { formatDate } from 'src/lib/utils/date';

import { ClientSchema } from './client-schema.interfaces';

export function getClientSchemaTitle(schema: ClientSchema): string {
  const parts = [schema.id];

  if (schema.description !== undefined) {
    parts.push(schema.description);
  }

  if (schema.type === 'PLP') {
    parts.push(schema.annee);
  }

  const date = (schema.timbreMaj || {date: undefined}).date;
  if (date !== undefined) {
    parts.push(formatDate(date));
  }

  return parts.join(' - ');
}
