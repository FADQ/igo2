import { NgModule} from '@angular/core';

import { FadqLibClientModule } from 'src/lib/client/client.module';
import { FadqClientToolModule } from './client-tool/client-tool.module';
import { FadqClientListToolModule } from './client-list-tool/client-list-tool.module';


@NgModule({
  imports: [
    FadqLibClientModule.forRoot(),
    FadqClientToolModule,
    FadqClientListToolModule
  ],
  exports: [
    FadqLibClientModule
  ],
  declarations: []
})
export class FadqClientModule {}
