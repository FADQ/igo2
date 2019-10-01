import { NgModule} from '@angular/core';

import { FadqLibClientModule } from 'src/lib/client/client.module';
import { FadqClientToolModule } from './client-tool/client-tool.module';
import { FadqClientTxToolModule } from './client-tx-tool/client-tx-tool.module';

@NgModule({
  imports: [
    FadqLibClientModule.forRoot(),
    FadqClientToolModule,
    FadqClientTxToolModule
  ],
  exports: [
    FadqLibClientModule
  ],
  declarations: []
})
export class FadqInterneClientModule {}
