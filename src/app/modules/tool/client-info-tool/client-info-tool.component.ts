import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Register } from '@igo2/context';

import { EntityStore } from '../../entity/shared/store';
import { Client, ClientSchema } from '../../client/shared/client.interface';
import { ClientStoreService } from '../../client/shared/client-store.service';


@Register({
  name: 'clientInfo',
  title: 'tools.clientInfo',
  icon: 'person'
})
@Component({
  selector: 'fadq-client-info-tool',
  templateUrl: './client-info-tool.component.html',
  styleUrls: ['./client-info-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class  ClientInfoToolComponent {

  get client(): Client {
    return this.clientStoreService.getClient();
  }

  get schemaStore(): EntityStore<ClientSchema> {
    return this.clientStoreService.schemaStore;
  }

  constructor(private clientStoreService: ClientStoreService) {}
}
