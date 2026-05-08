import { EntityKey } from '@igo2/common/entity';
import { FeatureDto } from './feature.dto';

export interface TransactionDataDto {
  inserts: FeatureDto[];
  updates: FeatureDto[];
  deletes: EntityKey[];
}
