import { FeatureGeometry } from '@igo2/geo';
import { EntityKey } from '@igo2/common/entity';

export interface FeatureDto {
  id?: EntityKey;
  type: string;
  geometry: FeatureGeometry;
  properties: Record<string, any>;
}
