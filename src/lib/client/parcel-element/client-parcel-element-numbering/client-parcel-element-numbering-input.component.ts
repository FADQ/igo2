import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Optional,
  Self,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FormBuilder, FormGroup, ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';

export interface MultipartNoParcel {
  number: string;
  prefix?: string;
  suffix?: string;
}

@Component({
  selector: 'fadq-client-parcel-element-numbering-input',
  templateUrl: './client-parcel-element-numbering-input.component.html',
  styleUrls: ['./client-parcel-element-numbering-input.component.scss'],
  providers: [{
    provide: MatFormFieldControl,
    useExisting: ClientParcelElementNumberingInputComponent
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientParcelElementNumberingInputComponent
    implements ControlValueAccessor, MatFormFieldControl<MultipartNoParcel>, OnDestroy {

  static nextId = 0;

  parts: FormGroup;

  focused = false;

  errorState = false;

  controlType = 'numbering-input';

  stateChanges = new Subject<void>();

  @Input()
  get placeholder(): string { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.parts.disable() : this.parts.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): MultipartNoParcel | null {
    const {value: {number, prefix, suffix}} = this.parts;
    if (number.length > 0 ) {
      return {number, prefix, suffix};
    }
    return null;
  }
  set value(noParcel: MultipartNoParcel | null) {
    const {number, prefix, suffix} = noParcel || {number: '', prefix: '', suffix: ''};
    this.parts.setValue({number, prefix, suffix});
    this.stateChanges.next();
  }

  @HostBinding('class.numbering-input-floating')
  id = `numbering-input-${ClientParcelElementNumberingInputComponent.nextId++}`;

  /**
   * @ignore
   */
  @HostBinding('attr.aria-describedby')
  describedBy = '';

  /**
   * @ignore
   */
  @HostBinding('class.numbering-input-floating')
  get shouldLabelFloat() { return this.focused || !this.empty; }

  get empty() {
    const {value: {prefix, number, suffix}} = this.parts;
    return !prefix && !number && !suffix;
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(
    formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl
  ) {

    this.parts = formBuilder.group({
      prefix: '',
      number: '',
      suffix: ''
    });

    _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });

    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this._elementRef.nativeElement.querySelector('input').focus();
    }
  }

  writeValue(noParcel: MultipartNoParcel | null): void {
    this.value = noParcel;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(): void {
    this.onChange(this.parts.value);
  }

}
