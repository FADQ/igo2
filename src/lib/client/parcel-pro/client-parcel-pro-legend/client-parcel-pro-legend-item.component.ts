import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'fadq-client-parcel-pro-legend-item',
  templateUrl: './client-parcel-pro-legend-item.component.html',
  styleUrls: ['./client-parcel-pro-legend-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelProLegendItemComponent {

  @Input() count: number;

  @Input() title: string;

  @Input() innerColor: string;

  @Input() outerColor: string;

  constructor() {}

}
