import { FormGroup, ValidationErrors } from '@angular/forms';

import { EntityStore } from '@igo2/common';
import { ClientSchemaType, UniqueClientSchemaType } from './client-schema.enums';
import { ClientSchema } from './client-schema.interfaces';

export function validateOnlyOneType(control: FormGroup, store: EntityStore<ClientSchema>): ValidationErrors | null {
  const schemaId = control.controls['id'].value;
  const schemaTypeControl = control.controls['type'];
  const schemaType = schemaTypeControl.value;

  if (schemaType in UniqueClientSchemaType) {
    const otherSchema = store.all().find((schema: ClientSchema) => {
      return schema.type === schemaType && schema.id !== schemaId;
    });

    if (otherSchema !== undefined) {
      if (schemaType === ClientSchemaType.LSE) {
        schemaTypeControl.setErrors({onlyOneLSE: ''});
      } else if (schemaType === ClientSchemaType.RPA){
        schemaTypeControl.setErrors({onlyOneRPA: ''});
      }
    }
  }

  return null;
}
