import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import OlPoint from 'ol/geom/Point';

import { DetailedContext } from '@igo2/context';
import { IgoMap } from '@igo2/geo';

import { ApiService } from 'src/lib/core/api';

import { ContextApiConfig } from './context.interfaces';

@Injectable()
export class CustomContextService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('contextApiConfig') private apiConfig: ContextApiConfig
  ) {}

  getContextFromMap(igoMap: IgoMap): DetailedContext {
    const view = igoMap.ol.getView();
    const proj = view.getProjection().getCode();
    const center: any = new OlPoint(view.getCenter()).transform(proj, 'EPSG:4326');

    const context = {
      id: '',
      uri: '',
      title: '',
      map: {
        view: {
          center: center.getCoordinates(),
          zoom: view.getZoom(),
          projection: proj,
          maxZoomOnExtent: igoMap.viewController.maxZoomOnExtent
        }
      },
      layers: [],
      tools: []
    };

    const layers = igoMap.layers$.getValue().sort((a, b) => a.zIndex - b.zIndex);
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i] as any;
      const layerOptions = layer.options;
      const dataSource = layer.dataSource;
      const dataSourceOptions = dataSource.options;
      if (dataSourceOptions.type) {
        context.layers.push({
          id: layerOptions.id ? String(layerOptions.id) : undefined,
          title: layerOptions.title,
          baseLayer: layer.baseLayer,
          zIndex: i + 1,
          visible: layer.visible,
          opacity: layer.opacity,
          sourceOptions: {
            type: dataSourceOptions.type,
            params:  dataSourceOptions.params,
            url:  dataSourceOptions.url,
            queryable: layer.queryable,
            optionsFromCapabilities: dataSourceOptions.optionsFromCapabilities,
            layer: dataSourceOptions.layer
          }
        });
      }

    }

    return context;
  }

  /**
   * Save a context
   * @param context The context to save
   * @returns An observable
   */
  saveContext(context: DetailedContext): Observable<object> {
    const url = this.apiService.buildUrl(this.apiConfig.save);
    return this.http.post(url, context);
  }

}
