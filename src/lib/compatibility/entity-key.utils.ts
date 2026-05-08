import { EntityKey } from '@igo2/common/entity';

/**
 * Normalise n'importe quelle clé vers string
 */
export function normalizeEntityKey(key: unknown): EntityKey {
  if (key === undefined || key === null) {
    return '';
  }
  return String(key);
}

/**
 * Générateur typé compatible IGO2
 */
export function entityKey<T>(
  selector: (entity: T) => unknown
): (entity: object) => EntityKey {
  return (entity: object) => {
    return normalizeEntityKey(selector(entity as T));
  };
}
