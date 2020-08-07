import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFeatureFormModule } from '@igo2/geo';

import { FadqLibEditionModule } from '../../../edition/edition.module';
import { FadqLibMessageInlineModule } from '../../../message/message-inline/message-inline.module';

import { FadqLibClientParcelProLegendModule } from '../client-parcel-pro-legend/client-parcel-pro-legend.module';

import { ClientParcelProWizardComponent } from './client-parcel-pro-wizard.component';
import { ClientParcelProWizardStep1Component } from './client-parcel-pro-wizard-step-1.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFeatureFormModule,
    FadqLibEditionModule,
    FadqLibMessageInlineModule,
    FadqLibClientParcelProLegendModule
  ],
  exports: [
    ClientParcelProWizardComponent
  ],
  declarations: [
    ClientParcelProWizardComponent,
    ClientParcelProWizardStep1Component
  ]
})
export class FadqLibClientParcelProWizardModule {}
