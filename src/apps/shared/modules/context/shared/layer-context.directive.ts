import {
  Directive,
  OnInit,
  OnDestroy,
  Input,
  inject
} from '@angular/core';

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
    selector: '[fadqLayerContext]',
    standalone: false
})
export class FadqLayerContextDirective implements OnInit, OnDestroy {
  private component = inject(MapBrowserComponent);
  private contextService = inject(ContextService);
  private layerService = inject(LayerService);
  private route = inject(RouteService, { optional: true });

  private context$$?: Subscription;
  private queryParams: any;
  private contextLayers: Layer[] = [];

  @Input() removeLayersOnContextChange: boolean = true;

  get map(): IgoMap {
    return this.component.map();
  }

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
    this.context$$?.unsubscribe();
  }

  private handleContextChange(context: DetailedContext) {
    if (context.layers === undefined) {
      return;
    }
    if (this.removeLayersOnContextChange === true) {
      this.map.layerController.all.forEach((layer: AnyLayer) => {
        this.map.layerController.remove(layer as Layer);
      });
    } else {
      this.contextLayers.forEach((layer: AnyLayer) => {
        this.map.layerController.remove(layer as Layer);
      });
    }
    this.contextLayers = [];

    const layers$ = zip(
      ...context.layers.map((layerOptions: LayerOptions) =>
        this.layerService.createAsyncLayer(layerOptions)
      )
    );

    layers$.subscribe((createdLayers: (Layer | undefined)[]) => {
      const layers = createdLayers
        .filter((layer): layer is Layer => layer !== undefined)
        .map((layer) => {
          layer.visible = this.computeLayerVisibilityFromUrl(layer);
          return layer;
        });

      this.contextLayers.push(...layers);
      layers.forEach((layer) => {
        this.map.layerController.add(layer);
      });
    });
  }

  private computeLayerVisibilityFromUrl(layer: Layer): boolean {
    const params = this.queryParams;
    const route = this.route;
    const currentContext = this.contextService.context$.value.uri;

    let visible = layer.visible;
    if (!params || !route || layer.id === undefined || layer.id === null) {
      return visible;
    }
    const currentLayerid = String(layer.id);

    const contextParams = params[route.options.contextKey as string];
    if (contextParams === currentContext || !contextParams) {
      let visibleOnLayersParams = '';
      let visibleOffLayersParams = '';
      let visiblelayers: string[] = [];
      let invisiblelayers: string[] = [];

      if (
        route.options.visibleOnLayersKey &&
        params[route.options.visibleOnLayersKey as string]
      ) {
        visibleOnLayersParams =
          params[route.options.visibleOnLayersKey as string];
      }
      if (
        route.options.visibleOffLayersKey &&
        params[route.options.visibleOffLayersKey as string]
      ) {
        visibleOffLayersParams =
          params[route.options.visibleOffLayersKey as string];
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
      if (visiblelayers.includes(currentLayerid)) {
        visible = true;
      }
      if (invisiblelayers.includes(currentLayerid)) {
        visible = false;
      }
    }

    return visible;
  }
}
