import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from '../environments/proto/environment';
import { FadqProtoAppModule } from './proto/app.module';

import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(FadqProtoAppModule)
  .catch(err => console.log(err));
