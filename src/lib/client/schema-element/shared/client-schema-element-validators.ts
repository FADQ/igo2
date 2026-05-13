import { AbstractControl, ValidationErrors } from '@angular/forms';

import { EntityStore } from '@igo2/common/entity';
import { UniqueClientSchemaType } from '../../schema/shared/client-schema.enums';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import {
    ClientSchemaElement
  } from './client-schema-element.interfaces';
/**
 * Validates only one label
 * @param control The control to validate information
 * @param store Store cantaining all schema elements of the schema to be validated
 * @param schema Schema to be validated
 * @returns Error if the label of the control is not unique
 */
export function validateOnlyOneLabel(
  control: AbstractControl,
  store: EntityStore<ClientSchemaElement>,
  schema: ClientSchema
): ValidationErrors | null {

  const labelControl = control.get('properties.etiquette');
  const idControl = control.get('properties.idElementGeometrique');

  if (!labelControl || !idControl) {
    return null;
  }

  const label = labelControl.value;
  const schemaElementId = idControl.value;

  if (schema.type in UniqueClientSchemaType) {

    const duplicate = store.all().find((schemaElement: ClientSchemaElement) => {
      return schemaElement.properties.etiquette === label &&
             schemaElement.properties.idElementGeometrique !== schemaElementId;
    });

    if (duplicate) {
      return { uniqueLabel: true };
    }
  }

  return null;
}
