import { Action, EntityStore, EntityTableTemplate } from '@igo2/common';

export interface EditorConfig {
  id: string;
  title: string;
  tableTemplate?: EntityTableTemplate;
  entityStore?: EntityStore<object>;
  actionStore?: EntityStore<Action>;
}
