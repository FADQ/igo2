import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';

import { IgoStopPropagationModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { PlaceSelectorComponent } from './place-selector.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSelectModule,
    IgoStopPropagationModule,
    IgoLanguageModule
  ],
  exports: [
    PlaceSelectorComponent
  ],
  declarations: [
    PlaceSelectorComponent
  ]
})
export class FadqLibPlaceSelectorModule {}
