import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FadqLibClientResolutionDialogModule } from './client-resolution-dialog/client-resolution-dialog.module';
import { FadqLibClientWorkspaceSelectorModule } from './client-workspace-selector/client-workspace-selector.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    FadqLibClientResolutionDialogModule,
    FadqLibClientWorkspaceSelectorModule
  ],
  declarations: []
})
export class FadqLibClientWorkspaceModule {}
