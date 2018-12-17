import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { Subject } from 'rxjs';

import OLGeoJSON from 'ol/format/GeoJSON';

import { uuid } from '@igo2/utils';

import { EntityStore, EntityFormTemplate, getEntityId } from 'src/lib/entity';
import { FEATURE } from 'src/lib/feature';
import { IgoMap } from 'src/lib/map';
import { WidgetComponent } from 'src/lib/widget';

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import { ClientSchemaElementSurface } from '../shared/client-schema-element.interfaces';
import { ClientSchemaElementSurfaceService } from '../shared/client-schema-element-surface.service';
import { ClientSchemaElementFormService } from '../shared/client-schema-element-form.service';

@Component({
  selector: 'fadq-client-schema-element-surface-create-form',
  templateUrl: './client-schema-element-surface-create-form.component.html',
  styleUrls: ['./client-schema-element-surface-create-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientSchemaElementSurfaceCreateFormComponent implements WidgetComponent, OnInit {

  public template$ = new Subject<EntityFormTemplate>();

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get schema(): ClientSchema {
    return this._schema;
  }
  set schema(value: ClientSchema) {
    this._schema = value;
    this.cdRef.detectChanges();
  }
  private _schema: ClientSchema;

  @Input()
  get element(): ClientSchemaElementSurface {
    return this._element;
  }
  set element(value: ClientSchemaElementSurface) {
    this._element = value;
  }
  private _element;

  @Input()
  get store(): EntityStore<ClientSchemaElementSurface> {
    return this._store;
  }
  set store(value: EntityStore<ClientSchemaElementSurface>) {
    this._store = value;
  }
  private _store;

  @Output() complete = new EventEmitter<ClientSchemaElementSurface>();
  @Output() cancel = new EventEmitter();

  constructor(
    private clientSchemaElementSurfaceService: ClientSchemaElementSurfaceService,
    private clientSchemaElementFormService: ClientSchemaElementFormService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.clientSchemaElementFormService.buildCreateSurfaceForm(this.map)
      .subscribe((template: EntityFormTemplate) => this.template$.next(template));
  }

  onSubmit(event: {entity: undefined, data: { [key: string]: any }}) {
    const element = this.parseData(event.data);
    this.onSubmitSuccess(element);
  }

  onCancel() {
    this.cancel.emit();
  }

  private onSubmitSuccess(element: ClientSchemaElementSurface) {
    if (this.store !== undefined) {
      this.store.addEntities([element], true);
    }
    // if (this.transaction !== undefined) {
    //   this.store.insert(element);
    // }
    this.complete.emit();
  }

  private parseData(data: { [key: string]: any }): ClientSchemaElementSurface {
    const olGeoJSON = new OLGeoJSON();
    const properties = {
      idSchema: 1 //getEntityId(this.schema)
    };

    const propertySuffix = 'properties.';
    Object.entries(data).forEach((entry: [string, any]) => {
      const [key, value] = entry;
      if (key.startsWith(propertySuffix)) {
        const property = key.substr(propertySuffix.length);
        properties[property] = value;
      }
    });

    const elementProjection =   'EPSG:4326';

    return {
      meta: {
        id: uuid()
      },
      type: FEATURE,
      geometry: olGeoJSON.writeGeometryObject(data.geometry, {
        featureProjection: this.map.projection,
        dataProjection: elementProjection
      }),
      projection: elementProjection,
      properties: properties
    };
  }

}
