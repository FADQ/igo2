import { FormGroup, ValidationErrors } from '@angular/forms';

import { EntityStore } from '@igo2/common';
import { ClientSchemaType } from './client-schema.enums';
import { ClientSchema } from './client-schema.interfaces';

export function validateOnlyOneType(control: FormGroup, store: EntityStore<ClientSchema>,uniqueSchemaType: string): ValidationErrors | null {
  const schemaId = control.controls['id'].value;
  const schemaTypeControl = control.controls['type'];
  const schemaType = schemaTypeControl.value;

  if (schemaType !== uniqueSchemaType) { return null; }

  const otherSchema = store.all().find((schema: ClientSchema) => {
    return schema.type === uniqueSchemaType && schema.id !== schemaId;
  });

  if (otherSchema !== undefined) {
    if (uniqueSchemaType === ClientSchemaType.LSE) {
      schemaTypeControl.setErrors({onlyOneLSE: ''});
    } else if (uniqueSchemaType === ClientSchemaType.RPA){
      schemaTypeControl.setErrors({onlyOneRPA: ''});
    }
  }

  return null;
}
