import { EntityKey, EntityOperation, EntityOperationType } from '@igo2/common/entity';
import { Feature } from '@igo2/geo';
import { FeatureDto, TransactionDataDto } from '@shared/dto';

/**
 * This class serializes an array of operations to TransactionData
 */
export class TransactionSerializer {

  serializeOperations(
    operations: EntityOperation<Feature>[]
  ): TransactionDataDto {

    const inserts: FeatureDto[] = [];
    const updates: FeatureDto[] = [];
    const deletes: EntityKey[] = [];

    operations.forEach((operation) => {

      switch (operation.type) {

        case EntityOperationType.Insert:
          inserts.push(this.toDto(operation.current));
          break;

        case EntityOperationType.Update:
          updates.push(this.toDto(operation.current));
          break;

        case EntityOperationType.Delete:
          deletes.push(operation.key);
          break;
      }
    });

    return { inserts, updates, deletes };
  }

  private toDto(feature: Feature): FeatureDto {
    return {
      id: (feature as any).id,
      type: feature.type,
      geometry: feature.geometry,
      properties: feature.properties
    };
  }
}
