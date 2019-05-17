import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatFormFieldModule, MatInputModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFormModule } from '@igo2/common';

import { FadqLibClientWorkspaceSelectorModule } from '../../workspace/client-workspace-selector/client-workspace-selector.module';

import { ClientSchemaParcelTransferFormComponent } from './client-schema-parcel-transfer-form.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    IgoLanguageModule,
    IgoFormModule,
    FadqLibClientWorkspaceSelectorModule
  ],
  exports: [
    ClientSchemaParcelTransferFormComponent
  ],
  declarations: [
    ClientSchemaParcelTransferFormComponent
  ],
  entryComponents: [
    ClientSchemaParcelTransferFormComponent
  ]
})
export class FadqLibClientSchemaParcelTransferFormModule {}
