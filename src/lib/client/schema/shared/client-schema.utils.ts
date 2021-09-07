import { ClientSchema } from './client-schema.interfaces';

export function getClientSchemaTitle(schema: ClientSchema): string {
  const parts = [schema.id];

  if (schema.description !== undefined) {
    parts.push(schema.description);
  }

  parts.push(schema.annee);

  return parts.join(' - ');
}
