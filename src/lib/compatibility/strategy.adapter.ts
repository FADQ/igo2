/**
 * Permet d'utiliser FeatureStoreStrategy avec EntityStore API
 */
export function asStrategy<T>(strategy: T): any {
  return strategy as unknown as any;
}
