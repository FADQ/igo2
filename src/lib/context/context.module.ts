import { NgModule, ModuleWithProviders } from '@angular/core';

import { provideCustomContextService } from './shared/context.providers';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class FadqLibContextModule {
  static forRoot(): ModuleWithProviders<FadqLibContextModule> {
    return {
      ngModule: FadqLibContextModule,
      providers: [
        provideCustomContextService()
      ]
    };
  }
}
