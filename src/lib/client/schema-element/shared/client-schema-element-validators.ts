import { FormGroup, ValidationErrors } from '@angular/forms';

import { EntityStore } from '@igo2/common';
import { UniqueClientSchemaType } from '../../schema/shared/client-schema.enums';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import {
    ClientSchemaElement,
    ClientSchemaElementType,
    ClientSchemaElementTypes
  } from './client-schema-element.interfaces';
/**
 * Validates only one label
 * @param control The control to validate information
 * @param store Store cantaining all schema elements of the schema to be validated
 * @param schema Schema to be validated
 * @returns Error if the label of the control is not unique
 */
export function validateOnlyOneLabel(control: FormGroup, store: EntityStore<ClientSchemaElement>, schema: ClientSchema): ValidationErrors | null {
  const labelControl = control.controls['properties.etiquette'];
  const schemaElementId = control.controls['properties.idElementGeometrique'].value;
  const label = labelControl.value;

  if (schema.type in UniqueClientSchemaType) {
    const otherElementSchema = store.all().find((schemaElement: ClientSchemaElement) => {
      return schemaElement.properties.etiquette === label && schemaElement.properties.idElementGeometrique !== schemaElementId;
    });

    if (otherElementSchema !== undefined) {
      labelControl.setErrors({uniqueLabel: ''});}
  }

  return null;
}
