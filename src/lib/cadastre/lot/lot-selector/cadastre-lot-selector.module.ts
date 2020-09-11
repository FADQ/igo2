import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule} from '@angular/material/select';

import { IgoLanguageModule } from '@igo2/core';

import { LotSelectorComponent } from './cadastre-lot-selector.component';

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
    IgoLanguageModule
  ],
  declarations: [LotSelectorComponent],
  exports: [LotSelectorComponent]
})
export class FadqLotSelectorModule {}
