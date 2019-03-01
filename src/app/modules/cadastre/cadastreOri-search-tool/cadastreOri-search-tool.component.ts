import {Component, ChangeDetectionStrategy, NgModule} from '@angular/core';
import { Register } from '@igo2/context';

@Register({
  name: 'cadastreOri',
  title: 'tools.cadastreOri',
  icon: 'grid_on'
})
@Component({
  selector: 'fadq-cadastreOri-search-tool',
  templateUrl: './cadastreOri-search-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CadastreOriSearchToolComponent {

  constructor() {}
}
