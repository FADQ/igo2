import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'fadq-client-parcel-pro-legend-thumbnail',
  templateUrl: './client-parcel-pro-legend-thumbnail.component.html',
  styleUrls: ['./client-parcel-pro-legend-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelProLegendThumbnailComponent {

  @Input() innerColor: string;

  @Input() outerColor: string;

  constructor() {}

}
