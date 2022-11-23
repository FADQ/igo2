import { FormGroup, ValidationErrors } from '@angular/forms';

import { EntityStore } from '@igo2/common';
import { LanguageService } from '@igo2/core';
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

export function setDescription(control: FormGroup, languageService: LanguageService): ValidationErrors | null {
  const schemaTypeControl = control.controls['type'];
  const schemaType = schemaTypeControl.value;
  const descriptionControl = control.controls['description'];
  //console.log('Test1');
  if (schemaType in UniqueClientSchemaType && descriptionControl !== undefined) {
    if (descriptionControl.value === '') {
      control.patchValue({description: languageService.translate.instant('client.schema.description.' + schemaType)}, {onlySelf: true, emitEvent: true});
      descriptionControl.disable({onlySelf: true, emitEvent: true});
    }
  }

  return null;
}
