import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  EventEmitter,
  Output,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[entityTableRow]'
})
export class EntityTableRowDirective {

  static selectedCls = 'fadq-entity-table-row-selected';

  @Input()
  get selection(): boolean {
    return this._selection;
  }
  set selection(value: boolean) {
    this._selection = value;
  }
  private _selection = false;

  @Input()
  get selected(): boolean {
    return this._selected;
  }
  set selected(value: boolean) {
    if (this.selection === false) {
      return;
    }

    if (value === this._selected) {
      return;
    }

    this.toggleSelected(value);
    this.scroll();
  }
  private _selected = false;

  @Output() select = new EventEmitter<EntityTableRowDirective>();

  @HostListener('click')
  onClick() {
    if (this.selection === false) {
      return;
    }

    this.toggleSelected(true);
    this.select.emit(this);
  }

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  private toggleSelected(selected: boolean) {
    this._selected = selected;
    if (selected) {
      this.addCls(EntityTableRowDirective.selectedCls);
    } else {
      this.removeCls(EntityTableRowDirective.selectedCls);
    }
  }

  private scroll() {
    if (this._selected === true) {
      this.el.nativeElement.scrollIntoView({behavior: 'smooth'});
    }
  }

  private addCls(cls: string) {
    this.renderer.addClass(this.el.nativeElement, cls);
  }

  private removeCls(cls: string) {
    this.renderer.removeClass(this.el.nativeElement, cls);
  }
}
