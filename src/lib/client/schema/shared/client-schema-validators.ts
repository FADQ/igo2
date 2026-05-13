import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { EntityStore } from '@igo2/common/entity';
import { ClientSchemaType, UniqueClientSchemaType } from './client-schema.enums';
import { ClientSchema } from './client-schema.interfaces';


export function onlyOneTypeValidator(store: EntityStore<ClientSchema>): ValidatorFn {
  return (control: AbstractControl) => validateOnlyOneType(control, store);
}


export function validateOnlyOneType(
  control: AbstractControl,
  store: EntityStore<ClientSchema>
): ValidationErrors | null {

  const formGroup = control as FormGroup;

  const schemaId = formGroup.controls['id']?.value;
  const schemaTypeControl = formGroup.controls['type'];
  const schemaType = schemaTypeControl?.value;

  if (schemaType in UniqueClientSchemaType) {
    const otherSchema = store.all().find((schema: ClientSchema) => {
      return schema.type === schemaType && schema.id !== schemaId;
    });

    if (otherSchema !== undefined) {
      if (schemaType === ClientSchemaType.LSE) {
        schemaTypeControl.setErrors({ onlyOneLSE: true });
      } else if (schemaType === ClientSchemaType.RPA) {
        schemaTypeControl.setErrors({ onlyOneRPA: true });
      }
    }
  }

  return null;
}
