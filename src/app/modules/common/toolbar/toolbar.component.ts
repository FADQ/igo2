import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  ChangeDetectionStrategy
} from '@angular/core';

import { Tool } from '@igo2/context';

// TODO: I'm not sure using a igo-list is the right thing to do
// It has built-in select and focu mechanism that we might not need
// and that we actually need to override. For example, we need
// to remove th background color with some css and we lose
// the focus/ripple effect when hovering/clicking a selected tool

const TOGGLE_TOOL = {
  name: '_toggle',
  icon: 'more_vert'
};

@Component({
  selector: 'fadq-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {

  public visible = true;

  @Input()
  get tools(): Tool[] {
    return this._tools;
  }
  set tools(value: Tool[]) {
    this._tools = value;
  }
  private _tools: Tool[] = [];

  @Input()
  get active(): Tool {
    return this._active;
  }
  set active(value: Tool) {
    this._active = value;
  }
  private _active: Tool;

  @Input()
  get collapsed() {
    return this._collapsed;
  }
  set collapsed(value: boolean) {
    this._collapsed = value;
  }
  private _collapsed = true;

  @Input()
  get withToggleButton(): boolean {
    return this._withToggleButton;
  }
  set withToggleButton(value: boolean) {
    this._withToggleButton = value;
  }
  private _withToggleButton = false;

  @Input()
  get horizontal(): boolean {
    return this._horizontal;
  }
  set horizontal(value: boolean) {
    this._horizontal = value;
  }
  private _horizontal = false;

  @Input()
  get withTitle(): boolean {
    return this._withTitle;
  }
  set withTitle(value: boolean) {
    this._withTitle = value;
  }
  private _withTitle = true;

  @Input()
  get withIcon(): boolean {
    return this._withIcon;
  }
  set withIcon(value: boolean) {
    this._withIcon = value;
  }
  private _withIcon = true;

  @Input()
  get xPosition(): string {
    return this._xPosition;
  }
  set xPosition(value: string) {
    this._xPosition = value;
  }
  private _xPosition = 'before';

  @Input()
  get yPosition(): string {
    return this._yPosition;
  }
  set yPosition(value: string) {
    this._yPosition = value;
  }
  private _yPosition = 'above';

  @Input()
  get overlayClass(): string {
    return [this._overlayClass, 'fadq-toolbar-overlay'].join(' ');
  }
  set overlayClass(value: string) {
    this._overlayClass = value;
  }
  private _overlayClass = '';

  @Output() activate = new EventEmitter<Tool>();
  @Output() open = new EventEmitter();
  @Output() close = new EventEmitter();

  @HostBinding('class.with-title')
  get withTitleClass() {
    return this.withTitle;
  }

  @HostBinding('class.with-icon')
  get withIconClass() {
    return this.withIcon;
  }

  @HostBinding('class.horizontal')
  get horizontalClass() {
    return this.horizontal;
  }

  get toggleTool(): Tool {
    return TOGGLE_TOOL;
  }

  constructor() {}

  getToolClass(tool: Tool): { [key: string]: boolean; } {
    const active = this.active !== undefined && this.active.name === tool.name;
    return {
      'fadq-toolbar-item-active': active
    };
  }

  activateTool(tool: Tool) {
    this.activate.emit(tool);
  }

  toggleToolbar() {
    this.visible = !this.visible;
  }
}