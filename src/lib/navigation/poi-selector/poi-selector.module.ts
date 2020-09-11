import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { IgoStopPropagationModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { PoiSelectorComponent } from './poi-selector.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    IgoStopPropagationModule,
    IgoLanguageModule
  ],
  exports: [
    PoiSelectorComponent
  ],
  declarations: [
    PoiSelectorComponent
  ]
})
export class FadqLibPoiSelectorModule {}
