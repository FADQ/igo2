import { FormGroup, ValidationErrors } from '@angular/forms';

import { EntityStore } from '@igo2/common';
import { ClientSchemaType } from './client-schema.enums';
import { ClientSchema } from './client-schema.interfaces';

export function validateOnlyOneLSE(control: FormGroup, store: EntityStore<ClientSchema>): ValidationErrors | null {
  const schemaId = control.controls['id'].value;
  const schemaTypeControl = control.controls['type'];
  const schemaType = schemaTypeControl.value;

  if (schemaType !== ClientSchemaType.LSE) { return null; }

  const otherLSESchema = store.all().find((schema: ClientSchema) => {
    return schema.type === ClientSchemaType.LSE && schema.id !== schemaId;
  });

  if (otherLSESchema !== undefined) {
    schemaTypeControl.setErrors({onlyOneLSE: ''});
  }

  return null;
}

export function validateAnnee(control: FormGroup): null {
  const schemaAnneeControl = control.controls['annee'];
  const schemaAnnee = schemaAnneeControl.value;

  const schemaTypeControl = control.controls['type'];
  const schemaType = schemaTypeControl.value;

  schemaAnneeControl.updateValueAndValidity({onlySelf: true});

  const requireAnnee = [ClientSchemaType.ADO, ClientSchemaType.PLP];
  if (!schemaAnnee && requireAnnee.indexOf(schemaType) >= 0) {
    schemaAnneeControl.setErrors({required: ''});
  }

  return null;
}
