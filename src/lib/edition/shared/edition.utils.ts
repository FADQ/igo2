import { getEntityTitle } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { Feature } from '@igo2/geo';
import { uuid } from '@igo2/utils';

export function getOperationTitle(feature: Feature, languageService: LanguageService) {
  return getEntityTitle(feature) || uuid();
}
