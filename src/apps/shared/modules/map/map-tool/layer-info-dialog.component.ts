import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ImageLayer } from '@igo2/geo';

import { substituteProperties } from 'src/lib/utils';

@Component({
  selector: 'fadq-layer-info-dialog',
  templateUrl: 'layer-info-dialog.component.html',
  styleUrls: ['./layer-info-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerInfoDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<LayerInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      layer: ImageLayer;
      baseUrl: string;
    },
    private domSanitizer: DomSanitizer
  ) {}

  computeLayerInfoLink(): SafeResourceUrl {
    const layer = this.data.layer;

    const url = substituteProperties(this.data.baseUrl, {
      layerName: layer.dataSource.options.params.LAYERS,
      layerTitle: layer.title
    });

    const encodedUrl = encodeURI(url).replace(/[!'()*]/g, escape);

    return this.domSanitizer.bypassSecurityTrustResourceUrl(encodedUrl);
  }
}
