import { FormGroup, ValidationErrors } from '@angular/forms';

import { EntityStore } from '@igo2/common';
import { ClientSchemaType,UniqueClientSchemaType } from '../../schema/shared/client-schema.enums';
import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import {
    ClientSchemaElement,
    ClientSchemaElementType,
    ClientSchemaElementTypes
  } from './client-schema-element.interfaces';
/**
 * Validates only one label
 * @param control 
 * @param store 
 * @param schema 
 * @returns only one label 
 */
export function validateOnlyOneLabel(control: FormGroup, store: EntityStore<ClientSchemaElement>, schema: ClientSchema): ValidationErrors | null {
  const labelControl = control.controls['properties.etiquette'];
  const schemaElementId = control.controls['properties.idElementGeometrique'].value;
  const label = control.controls['properties.etiquette'].value;

  if (schema.type in UniqueClientSchemaType) {
    const otherElementSchema = store.all().find((schemaElement: ClientSchemaElement) => {
      return schemaElement.properties.etiquette === label && schemaElement.properties.idElementGeometrique !== schemaElementId;
    });

    if (otherElementSchema !== undefined) {
      labelControl.setErrors({uniqueLabel: ''});}
  }

  return null;
}
