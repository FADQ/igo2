export type EntityKey = string;

/**
 * Normalise une clé pour EntityStore (IGO2)
 */
export function normalizeEntityKey(value: unknown): EntityKey {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

/**
 * ⚠️ IGO2 compatibility helper
 *
 * Permet de contourner l'incompatibilité:
 * (entity: T) => string ❌
 * vs
 * (entity: object) => string ✔
 */
export function entityKey<T>(
  extractor: (entity: T) => unknown
): (entity: object) => EntityKey {
  return (entity: object) =>
    normalizeEntityKey(extractor(entity as T));
}
