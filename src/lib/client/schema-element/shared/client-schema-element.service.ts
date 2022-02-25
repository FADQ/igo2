import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, zip } from 'rxjs';
import { concatMap, map, tap, catchError } from 'rxjs/operators';

import { EntityOperation, EntityTransaction } from '@igo2/common';

import { ApiService } from 'src/lib/core/api';
import { hexToRGB } from 'src/lib/utils/color';
import { TransactionSerializer, TransactionData } from 'src/lib/utils/transaction';

import { ClientSchema } from '../../schema/shared/client-schema.interfaces';
import {
  ClientSchemaElement,
  ClientSchemaElementApiConfig,
  ClientSchemaElementType,
  ClientSchemaElementTypes,
  ClientSchemaElementTypesResponse,
  ClientSchemaElementTypesResponseItem,
  GetElements,
  SaveElements
} from './client-schema-element.interfaces';

import { ClientSchemaElementPointService } from './client-schema-element-point.service';
import { ClientSchemaElementLineService } from './client-schema-element-line.service';
import { ClientSchemaElementSurfaceService } from './client-schema-element-surface.service';
import { computeSchemaElementArea } from './client-schema-element.utils';

@Injectable()
export class ClientSchemaElementService {

  private schemaElementTypes: {[key: string]: ClientSchemaElementTypes} = {};

  get services(): {[key: string]: object} {
    return {
      'Point': this.schemaElementPointService,
      'LineString': this.schemaElementLineService,
      'Polygon': this.schemaElementSurfaceService
    };
  }

  constructor(
    private schemaElementPointService: ClientSchemaElementPointService,
    private schemaElementLineService: ClientSchemaElementLineService,
    private schemaElementSurfaceService: ClientSchemaElementSurfaceService,
    private http: HttpClient,
    private apiService: ApiService,
    @Inject('clientSchemaElementApiConfig') private apiConfig: ClientSchemaElementApiConfig
  ) {}

  /**
   * Get all the elements of a schema.
   * @param schema Schema
   * @returns Observable of the all the elements of the schema
   */
  getSchemaElements(schema: ClientSchema): Observable<ClientSchemaElement[]> {
    const schemaElements$ = zip(
      this.schemaElementPointService.getSchemaElements(schema),
      this.schemaElementLineService.getSchemaElements(schema),
      this.schemaElementSurfaceService.getSchemaElements(schema)
    );

    return schemaElements$.pipe(
      map((schemaElements: [ClientSchemaElement[], ClientSchemaElement[], ClientSchemaElement[]]) => {
        return [].concat(...schemaElements);
      })
    );
  }

  /**
   * This method returns the element types supported for by a given type of schema.
   * @param schemaType Schema type (code)
   * @returns Observable of the element types, grouped by geometry type
   */
  getSchemaElementTypes(schemaType: string): Observable<ClientSchemaElementTypes> {
    if (this.schemaElementTypes[schemaType] !== undefined) {
      return of(this.schemaElementTypes[schemaType]);
    }

    const url = this.apiService.buildUrl(this.apiConfig.domains.type, {
      schemaType: schemaType
    });
    return this.http
      .get(url)
      .pipe(
        map((response: ClientSchemaElementTypesResponse) => {
          return this.extractSchemaElementTypesFromResponse(response);
        }),
        tap((schemaElementTypes: ClientSchemaElementTypes) => {
          this.cacheSchemaElementTypes(schemaType, schemaElementTypes);
        })
      );
  }

  getSchemaElementTypeDescription(schemaType: string, schemaElementType: string): Observable<string> {
    return this.getSchemaElementTypes(schemaType)
      .pipe(
        map((types: ClientSchemaElementTypes): string => {
          const allTypes = Object.values(types)
            .reduce((acc: ClientSchemaElementType[], _types: ClientSchemaElementTypes) => {
              return acc.concat(...Object.values(_types));
            }, []);
          const type = allTypes.find((_type: ClientSchemaElementType) => _type.value === schemaElementType);

          return type ? type.title : undefined;
        })
      );
  }

  /**
   * This method returns the geometry types supported by a given type of schema.
   * @param schemaType Schema type (code)
   * @returns Observable of the geometry types
   */
  getSchemaElementGeometryTypes(schemaType: string): Observable<string[]> {
    return this.getSchemaElementTypes(schemaType).pipe(
      map((schemaElementTypes: ClientSchemaElementTypes) => {
        return Object.keys(schemaElementTypes).filter((key: string) => schemaElementTypes[key].length > 0);
      })
    );
  }

  /**
   * Create a schema element from partial data, withtout saving it
   * @param schema Schema of the element
   * @param data Schema element data
   * @returns Observable of the schema element
   */
  createSchemaElement(
    schema: ClientSchema,
    data: Partial<ClientSchemaElement>
  ): Observable<ClientSchemaElement | undefined> {
    const properties = Object.assign({
      idSchema: schema.id,
      idElementGeometrique: undefined,
      typeElement: undefined,
      descriptionTypeElement: undefined,
      etiquette: undefined,
      description: undefined,
      anneeImage: undefined,
      timbreMaj: undefined,
      usagerMaj: undefined
    }, data.properties);

    const partial = Object.assign({}, data, {properties}) as ClientSchemaElement;

    return zip(
      of(partial),
      this.getSchemaElementGeometryTypes(schema.type),
      this.getSchemaElementTypeDescription(schema.type, properties.typeElement)
    ).pipe(
      map((bunch: [ClientSchemaElement, string[], string]) => {
        const [schemaElement, geometryTypes, typeDescription] = bunch;
        if (!geometryTypes.includes(schemaElement.geometry.type)) {
          return undefined;
        }

        schemaElement.properties.descriptionTypeElement = typeDescription;
        schemaElement.properties.superficie = computeSchemaElementArea(schemaElement);
        return schemaElement;
      })
    );
  }

  /**
   * Commit (save) a whole transaction  containig points, lines and polygons. Each of those geometry type
   * has it's own endpoint so we're making 3 requests. On a success, elements of the same geometry
   * type are fetched and returned
   * @param schema Schema
   * @param transaction Transaction shared by all geometry types
   * @returns Observable of the all the elements by geometry type or of an error object
   */
  commitTransaction(
    schema: ClientSchema,
    transaction: EntityTransaction
  ): Observable<Array<ClientSchemaElement[] | Error>> {
    const commits$ = ['Point', 'LineString', 'Polygon'].map((type: string) => {
      const operations = transaction.operations.all().filter((operation: EntityOperation) => {
        const schemaElement = (operation.current || operation.previous) as ClientSchemaElement;
        return schemaElement.geometry.type === type;
      });

      return transaction.commit(operations, (tx: EntityTransaction, ops: EntityOperation[]) => {
        return this.commitOperationsOfType(schema, ops, type);
      });
    });

    return zip(...commits$);
  }

  /**
   * Commit (save) some operations of a transaction
   * @param schema Schema
   * @param operations Transaction operations
   * @param geometryType The geometry type of the data we're saving
   * @returns Observable of the all the elements of that by geometry type or of an error object
   */
  private commitOperationsOfType(
    schema: ClientSchema,
    operations: EntityOperation[],
    geometryType: string
  ): Observable<ClientSchemaElement[] | Error> {
    const serializer = new TransactionSerializer<ClientSchemaElement>();
    const data = serializer.serializeOperations(operations);
    return this.saveElements(schema, data, geometryType);
  }

  /**
   * Save the elements of a geometry type then fetch all the elements of the type.
   * @param schema Schema
   * @param data Data to save
   * @param geometryType The geometry type of the data we're saving
   * @returns Observable of the all the elements of that by geometry type or of an error object
   */
  private saveElements(
    schema: ClientSchema,
    data: TransactionData<ClientSchemaElement>,
    geometryType: string
  ): Observable<ClientSchemaElement[] | Error> {
    const service = this.services[geometryType];

    return (service as SaveElements).saveElements(schema, data)
      .pipe(
        catchError(() => of(new Error(geometryType))),
        concatMap((response: any) => {
          if (response instanceof Error) {
            return of(response);
          } else {
            return (service as GetElements).getSchemaElements(schema);
          }
        })
      );
  }

  /**
   * Extract schema elements from response
   * @param response Backend response
   * @returns Observable of schema elements
   */
  private extractSchemaElementTypesFromResponse(
    response: ClientSchemaElementTypesResponse
  ): ClientSchemaElementTypes {
    const createChoice = (item: ClientSchemaElementTypesResponseItem) => {
      return {
        value: item.idTypeElement,
        title: item.libelleFrancaisAbr,
        color: hexToRGB(item.couleurElement),
        icon: item.iconeElement
      };
    };

    return {
      Point: response.data.lstTypeElementPoint.map(createChoice),
      LineString: response.data.lstTypeElementLigne.map(createChoice),
      Polygon: response.data.lstTypeElementSurface.map(createChoice)
    };
  }

  /**
   * Cache the schema element types by schema type
   * @param schemaType Schema type
   * @param elementTypes Element types
   */
  private cacheSchemaElementTypes(schemaType: string, schemaElementTypes: ClientSchemaElementTypes) {
    this.schemaElementTypes[schemaType] = schemaElementTypes;
  }

}
