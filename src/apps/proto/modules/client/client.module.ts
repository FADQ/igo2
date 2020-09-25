import { NgModule} from '@angular/core';

import { FadqLibClientModule } from 'src/lib/client/client.module';
import { FadqClientParcelToolModule } from './client-parcel-tool/client-parcel-tool.module';

@NgModule({
  imports: [
    FadqLibClientModule.forRoot(),
    FadqClientParcelToolModule
  ],
  exports: [
    FadqLibClientModule
  ],
  declarations: []
})
export class FadqProtoClientModule {}
