import { EntityRecord, EntityState } from '@igo2/common/entity';

export function typedAccessor<
  T extends Record<string, any>,
  R = any
>(
  fn: (entity: T, record: EntityRecord<T, EntityState>) => R
) {
  return fn as unknown as (
    entity: object,
    record: EntityRecord<object, EntityState>
  ) => R;
}

export function typedRowClass<T>(
  fn: (entity: T) => Record<string, boolean>
) {
  return fn as unknown as (entity: object) => Record<string, boolean>;
}
