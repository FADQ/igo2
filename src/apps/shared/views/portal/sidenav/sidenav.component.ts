import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { Tool, Toolbox } from '@igo2/common/tool';
import { ToolState } from '@igo2/integration';
import {
  StorageService,
  StorageScope
} from '@igo2/core/storage';

@Component({
  selector: 'fadq-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent implements OnInit, OnDestroy {

  title$: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

  private activeTool$$: Subscription;

  @Input()
  set opened(value: boolean) {
    if (value === this._opened) {
      return;
    }
    this._opened = value;
    this.openedChange.emit(this._opened);
  }
  get opened(): boolean { return this._opened; }
  private _opened: boolean;

  @Output() openedChange = new EventEmitter<boolean>();

  get toolbox(): Toolbox { return this.toolState.toolbox; }

  constructor(
    private toolState: ToolState,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.activeTool$$ = this.toolbox.activeTool$.subscribe((tool: Tool) => {
      this.title$.next(tool ? tool.title : 'IGO');
    });
  }

  ngOnDestroy() {
    this.activeTool$$.unsubscribe();
  }

  onDeactivateButtonClick() {
    this.toolbox.deactivateTool();
  }

  // Depuis IGO v17, le catalogue sélectionné est conservé dans le stockage
  // de session via la clé « selectedCatalogId ».
  //
  // Dans l'implantation standard d'IGO, le retour de catalogBrowser vers
  // l'outil catalog réinitialise cette valeur automatiquement.
  //
  // À la FADQ, catalogBrowser est intégré à l'outil fadqMap plutôt qu'à
  // l'outil catalog. La réinitialisation n'est donc jamais exécutée lors
  // du retour vers fadqMap.
  //
  // Sans ce nettoyage, catalogBrowser se réouvre automatiquement après un
  // clic sur « Retour ». On vide donc manuellement selectedCatalogId avant
  // de réactiver l'outil précédent.
  onPreviousButtonClick() {

    const [previous, current] =
      this.toolbox.getCurrentPreviousToolName();

    if (
      previous === 'fadqMap' &&
      current === 'catalogBrowser'
    ) {
      this.storageService.set(
        'selectedCatalogId',
        '',
        StorageScope.SESSION
      );
    }

    this.toolbox.activatePreviousTool();
  }

}
