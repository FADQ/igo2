import { Directive, OnInit, OnDestroy, Optional, Input } from '@angular/core';

import { Subscription, zip } from 'rxjs';
import { filter } from 'rxjs/operators';

import { RouteService } from '@igo2/core/route';
import {
  MapBrowserComponent,
  Layer,
  LayerService,
  LayerOptions,
  IgoMap,
  AnyLayer
} from '@igo2/geo';

import { ContextService, DetailedContext } from '@igo2/context';

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

    // ✅ ATTENDRE QUE LA MAP SOIT PRÊTE
    if (!this.isMapReady()) {
      this.waitForMapReady(() => this.handleContextChange(context));
      return;
    }

    // ✅ REMOVE CONTEXT LAYERS
    if (this.removeLayersOnContextChange === true) {

      // retirer uniquement les layers dynamiques/contextuels
      this.contextLayers.forEach((layer: AnyLayer) => {
        this.map.removeLayer(layer);
      });

    } else {

      this.contextLayers.forEach((layer: AnyLayer) => {
        this.map.removeLayer(layer);
      });

    }

    this.contextLayers = [];

    const layersAndIndex$ = zip(
      ...context.layers.map((layerOptions: LayerOptions) => {
        return this.layerService.createAsyncLayer(layerOptions);
      })
    );

    layersAndIndex$
      .subscribe((layers: (Layer | undefined)[]) => {

        const validLayers = layers
          .filter((layer): layer is Layer => layer !== undefined)
          .map((layer: Layer) => {

            const computed = this.computeLayerVisibilityFromUrl(layer);
            // applique seulement si override explicite
            if (computed !== layer.visible) {
              layer.visible = computed;
            }

            return layer;
          });

        this.contextLayers.push(...validLayers);

        validLayers.forEach((layer: Layer) => {
          this.map.addLayer(layer);
        });

        // ✅ ✅ ✅ AJOUT ICI
        setTimeout(() => {
          requestAnimationFrame(() => {
            this.applyFinalVisibility(context);
          });
        }, 300);
      });
  }

  private applyFinalVisibility(context: DetailedContext) {
    if (!context?.layers) return;

    context.layers.forEach(opt => {
      const layer = this.map.layers.find(l => l.id === opt.id);

      if (layer?.ol) {
        const visible = opt.visible === true;

        // ✅ OpenLayers
        layer.ol.setVisible(visible);

        // ✅ IGO (LA CLÉ)
        layer.visible = visible;
      }
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
      if (visiblelayers.indexOf(currentLayerid) > -1 || visiblelayers.indexOf(currentLayerid.toString()) > -1) {
        visible = true;
      }
      if (invisiblelayers.indexOf(currentLayerid) > -1 || invisiblelayers.indexOf(currentLayerid.toString()) > -1) {
        visible = false;
      }
    }

    return visible;
  }

  private isMapReady(): boolean {
    return !!(
      this.map?.ol &&
      this.map.ol.getLayers
    );
  }

  private waitForMapReady(callback: () => void) {
    const interval = setInterval(() => {
      if (this.isMapReady()) {
        clearInterval(interval);
        callback();
      }
    }, 50);
  }
}
