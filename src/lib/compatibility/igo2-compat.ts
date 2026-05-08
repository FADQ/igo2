import { EntityStore } from '@igo2/common/entity';
import { Workspace } from '@igo2/common/workspace';
import { FeatureStore } from '@igo2/geo';

/**
 * Types unifiés
 */
export type AnyEntity = Record<string, any>;
export type AnyEntityStore = EntityStore<object>;
export type AnyWorkspace = Workspace<object>;
export type AnyFeatureStore = FeatureStore<any>;

/**
 * ENTITY STORE
 */
export function asEntityStore<T extends object>(
  store: EntityStore<T>
): AnyEntityStore {
  return store as unknown as AnyEntityStore;
}

/**
 * FeatureStore → EntityStore (compat IGO2)
 */
export function asEntityStoreFromFeature(
  store: FeatureStore<any>
): EntityStore<object> {
  return store as unknown as EntityStore<object>;
}

/**
 * FeatureStore → version générique safe pour IGO2
 */
export function asFeatureStore(store: FeatureStore<any>): FeatureStore<any> {
  return store as unknown as FeatureStore<any>;
}

/**
 * WORKSPACE
 */
export function asWorkspace<T extends object>(
  workspace: Workspace<T>
): AnyWorkspace {
  return workspace as unknown as AnyWorkspace;
}

/**
 * OPERATION
 */
export function asOperation<T>(op: T): any {
  return op as unknown as any;
}
