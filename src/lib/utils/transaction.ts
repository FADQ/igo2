import { EntityKey, EntityOperation, EntityOperationType } from '@igo2/common';
import { Feature } from '@igo2/geo';

/**
 * Structure receivable by the save element (parcel/schema) endpoints.
 */
export interface TransactionData<E> {
  lstElementsAjoutes: E[];
  lstElementsModifies: E[];
  lstIdElementsSupprimes: string[];
}

/**
 * This class serializes an array of operations to TransactionData
 */
export class TransactionSerializer<E extends Feature> {

  /**
   * Serialize operations
   * @param operations Array of entity operations
   * @returns Transaction data
   */
  serializeOperations(operations: EntityOperation[]): TransactionData<E> {
    const inserts = [];
    const updates = [];
    const deletes = [];

    operations.forEach((operation: EntityOperation<E>) => {
      if (operation.type === EntityOperationType.Insert) {
        inserts.push(this.serializeInsert(operation));
      } else if (operation.type === EntityOperationType.Update) {
        updates.push(this.serializeUpdate(operation));
      } else if (operation.type === EntityOperationType.Delete) {
        deletes.push(this.serializeDelete(operation));
      }
    });

    return {
      lstElementsAjoutes: inserts,
      lstElementsModifies: updates,
      lstIdElementsSupprimes: deletes
    };
  }

  /**
   * @internal
   */
  private serializeInsert(operation: EntityOperation<E>): Partial<E> {
    return this.serializeElement(operation.current);
  }

  /**
   * @internal
   */
  private serializeUpdate(operation: EntityOperation<E>): Partial<E> {
    return this.serializeElement(operation.current);
  }

  /**
   * @internal
   */
  private serializeDelete(operation: EntityOperation<E>): EntityKey {
    return operation.key;
  }

  /**
   * @internal
   */
  private serializeElement(element: E): Partial<E> {
    return {
      type: element.type,
      geometry: element.geometry,
      properties: element.properties
    } as Partial<E>;
  }

}
