import { FeatureStore } from '@igo2/geo';

/**
 * Adapter FeatureStore neutre (IGO2-safe)
 */
export function toFeatureStore(
  store: FeatureStore<any>
): FeatureStore<any> {
  return store as unknown as FeatureStore<any>;
}
