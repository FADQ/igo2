import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from '../environments/pes/environment';
import { FadqPesAppModule } from './pes/app.module';

import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(FadqPesAppModule)
  .catch(err => console.log(err));
