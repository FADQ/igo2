import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { ConfigService } from '@igo2/core';
import { BehaviorSubject } from 'rxjs';

import { HelpGuide } from '../shared/help.interfaces';

/**
 * Help tool
 */

@Component({
  selector: 'fadq-help-tool',
  templateUrl: './help-tool.component.html',
  styleUrls: ['./help-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpToolComponent implements OnInit {

  readonly guides$: BehaviorSubject<HelpGuide[]> = new BehaviorSubject([]);

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    const guides = this.configService.getConfig('help.guides') || [];
    this.guides$.next(guides);
  }
}
