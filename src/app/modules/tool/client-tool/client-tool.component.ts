import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { Register } from '@igo2/context';

import { EntityStore } from 'src/app/modules/entity';
import {
  Client,
  ClientParcelDiagram,
  ClientParcelYear,
  ClientSchema,
} from 'src/app/modules/client';
import { ClientState } from 'src/app/state';

@Register({
  name: 'client',
  title: 'tools.client',
  icon: 'person'
})
@Component({
  selector: 'fadq-client-tool',
  templateUrl: './client-tool.component.html',
  styleUrls: ['./client-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientToolComponent {

  get client$(): Observable<Client> {
    return this.clientState.client$;
  }

  get parcelYearStore(): EntityStore<ClientParcelYear> {
    return this.clientState.parcelYearStore;
  }

  get diagramStore(): EntityStore<ClientParcelDiagram> {
    return this.clientState.diagramStore;
  }

  get schemaStore(): EntityStore<ClientSchema> {
    return this.clientState.schemaStore;
  }

  constructor(
    private clientState: ClientState
  ) {}

}