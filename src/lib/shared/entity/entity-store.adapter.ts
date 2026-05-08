import { EntityStore } from '@igo2/common/entity';

/**
 * Adapter sécurisé pour EntityStore
 */
export function asEntityStore<T extends object>(
  store: EntityStore<T>
): EntityStore<object> {
  return store as unknown as EntityStore<object>;
}
