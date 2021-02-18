import { Directive, OnInit, OnDestroy, Optional, Input } from '@angular/core';

import { Subscription, zip } from 'rxjs';
import { filter } from 'rxjs/operators';

import { RouteService } from '@igo2/core';
import {
  MapBrowserComponent,
  Layer,
  LayerService,
  LayerOptions,
  IgoMap
} from '@igo2/geo';

import { ContextService, DetailedContext  } from '@igo2/context';

@Directive({
  selector: '[fadqLayerContext]'
})
export class FadqLayerContextDirective implements OnInit, OnDestroy {
  private context$$: Subscription;
  private queryParams: any;

  private contextLayers: Layer[] = [];

  @Input() removeLayersOnContextChange: boolean = true;

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(
    private component: MapBrowserComponent,
    private contextService: ContextService,
    private layerService: LayerService,
    @Optional() private route: RouteService
  ) {}

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .pipe(filter((context) => context !== undefined))
      .subscribe((context) => this.handleContextChange(context));

    if (
      this.route &&
      this.route.options.visibleOnLayersKey &&
      this.route.options.visibleOffLayersKey &&
      this.route.options.contextKey
    ) {
      const queryParams$$ = this.route.queryParams.subscribe((params) => {
        if (Object.keys(params).length > 0) {
          this.queryParams = params;
          queryParams$$.unsubscribe();
        }
      });
    }
  }

  ngOnDestroy() {
    this.context$$.unsubscribe();
  }

  private handleContextChange(context: DetailedContext) {
    if (context.layers === undefined) {
      return;
    }
    if (this.removeLayersOnContextChange === true) {
      this.map.removeAllLayers();
    } else {
      this.map.removeLayers(this.contextLayers);
    }
    this.contextLayers = [];

    const layersAndIndex$ = zip(...context.layers.map((layerOptions: LayerOptions, index: number) => {
      return this.layerService.createAsyncLayer(layerOptions);
    }));

    layersAndIndex$
      .subscribe((layers: Layer[]) => {
        layers = layers
          .filter((layer: Layer) => layer !== undefined)
          .map((layer) => {
            layer.visible = this.computeLayerVisibilityFromUrl(layer);
            layer.zIndex = layer.zIndex;

            return layer;
          });
        this.contextLayers.push(...layers);
        this.map.addLayers(layers);
      });
  }

  private computeLayerVisibilityFromUrl(layer: Layer): boolean {
    const params = this.queryParams;
    const currentContext = this.contextService.context$.value.uri;
    const currentLayerid: string = layer.id;

    let visible = layer.visible;
    if (!params || !currentLayerid) {
      return visible;
    }

    const contextParams = params[this.route.options.contextKey as string];
    if (contextParams === currentContext || !contextParams) {
      let visibleOnLayersParams = '';
      let visibleOffLayersParams = '';
      let visiblelayers: string[] = [];
      let invisiblelayers: string[] = [];

      if (
        this.route.options.visibleOnLayersKey &&
        params[this.route.options.visibleOnLayersKey as string]
      ) {
        visibleOnLayersParams =
          params[this.route.options.visibleOnLayersKey as string];
      }
      if (
        this.route.options.visibleOffLayersKey &&
        params[this.route.options.visibleOffLayersKey as string]
      ) {
        visibleOffLayersParams =
          params[this.route.options.visibleOffLayersKey as string];
      }

      /* This order is important because to control whichever
       the order of * param. First whe open and close everything.*/
      if (visibleOnLayersParams === '*') {
        visible = true;
      }
      if (visibleOffLayersParams === '*') {
        visible = false;
      }

      // After, managing named layer by id (context.json OR id from datasource)
      visiblelayers = visibleOnLayersParams.split(',');
      invisiblelayers = visibleOffLayersParams.split(',');
      if (visiblelayers.indexOf(currentLayerid) > -1  || visiblelayers.indexOf(currentLayerid.toString()) > -1) {
        visible = true;
      }
      if (invisiblelayers.indexOf(currentLayerid) > -1 || invisiblelayers.indexOf(currentLayerid.toString()) > -1) {
        visible = false;
      }
    }

    return visible;
  }
}
