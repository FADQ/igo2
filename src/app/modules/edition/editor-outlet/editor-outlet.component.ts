import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import { Subscription } from 'rxjs';

import { Entity } from 'src/app/modules/entity';
import { Widget } from 'src/app/modules/widget';
import { Editor } from 'src/app/modules/edition';

@Component({
  selector: 'fadq-editor-outlet',
  templateUrl: './editor-outlet.component.html',
  styleUrls: ['./editor-outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorOutletComponent implements OnDestroy {

  public component: any;
  public componentData: { [key: string]: any };
  public subscribers: { [key: string]: (event: any) => void };

  private entity$$: Subscription;
  private widget$$: Subscription;

  @Input()
  get editor(): Editor {
    return this._editor;
  }
  set editor(value: Editor) {
    this._editor = value;
    this.bindEditor();
  }
  private _editor;

  @Output() display = new EventEmitter();

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnDestroy() {
    this.unbindEditor();
  }

  private bindEditor() {
    this.unbindEditor();

    if (this.editor === undefined) {
      return;
    }

    this.entity$$ = this.editor.entity$
      .subscribe((entity: Entity) => this.onEntityChange(entity));
    this.widget$$ = this.editor.widget$
      .subscribe((widget: Widget) => this.onWidgetChange(widget));
  }

  private unbindEditor() {
    if (this.entity$$ !== undefined) {
      this.entity$$.unsubscribe();
    }
    if (this.widget$$ !== undefined) {
      this.widget$$.unsubscribe();
    }
  }

  private onEntityChange(entity: Entity) {
    this.componentData = this.editor.getComponentData();
    this.cdRef.detectChanges();
  }

  private onWidgetChange(widget: Widget) {
    this.componentData = this.editor.getComponentData();

    if (widget !== undefined) {
      this.component = widget.component;
      this.subscribers = widget.subscribers;
    } else {
      this.component = undefined;
      this.subscribers = undefined;
    }

    if (this.component !== undefined) {
      this.display.emit();
    }

    this.cdRef.detectChanges();
  }

}
