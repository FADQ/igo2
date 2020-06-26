import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from '../environments/pes_interne/environment';
import { FadqPesInterneAppModule } from './pes_interne/app.module';

import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(FadqPesInterneAppModule)
  .catch(err => console.log(err));
