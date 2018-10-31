import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { arrayEqual } from '../../utils/array';
import { Record } from '../../data/shared/data.interface';
import { DataStore } from '../../data/shared/datastore';
import { SearchSource } from '../shared/sources/source';

export enum DisplayMode {
  Grouped = 'grouped',
  Flat = 'flat'
}

@Component({
  selector: 'fadq-search-results',
  templateUrl: './search-results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultsComponent implements OnInit, OnDestroy {

  public displayMode = DisplayMode;

  private records$$: Subscription;
  private focused$$: Subscription;
  private focused: string[] = [];
  private selected$$: Subscription;
  private selected: string[] = [];

  @Input()
  get store(): DataStore<Record> {
    return this._store;
  }
  set store(value: DataStore<Record>) {
    this._store = value;
  }
  private _store;

  @Input()
  get mode(): DisplayMode {
    return this._mode;
  }
  set mode(value: DisplayMode) {
    this._mode = value;
  }
  private _mode: DisplayMode = DisplayMode.Grouped;

  @Output() focus = new EventEmitter<Record>();
  @Output() select = new EventEmitter<Record>();
  @Output() unfocus = new EventEmitter<Record>();
  @Output() unselect = new EventEmitter<Record>();

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.records$$ = this.store.records$
      .subscribe((records: Record[]) => this.cdRef.detectChanges());

    this.focused$$ = this.store.focused$
      .pipe(
        filter((records: Record[]) => {
          const rids = records.map((record: Record) => record.rid);
          return !arrayEqual(rids, this.focused);
        })
      )
      .subscribe((records: Record[]) => {
        this.focused = records.map((record: Record) => record.rid);
        this.cdRef.detectChanges();
      });

    this.selected$$ = this.store.selected$
      .pipe(
        filter((records: Record[]) => {
          const rids = records.map((record: Record) => record.rid);
          return !arrayEqual(rids, this.selected);
        })
      )
      .subscribe((records: Record[]) => {
        this.selected = records.map((record: Record) => record.rid);
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.records$$.unsubscribe();
    this.focused$$.unsubscribe();
    this.selected$$.unsubscribe();
  }

  sortByOrder(record1: Record, record2: Record) {
    return (
      (record1.provider as any as SearchSource).displayOrder -
      (record2.provider as any as SearchSource).displayOrder
    );
  }

  doFocus(record: Record) {
    this.focused = [record.rid];
    this.focus.emit(record);
    this.store.focus(record, true);
  }

  doSelect(record: Record) {
    this.selected = [record.rid];
    this.select.emit(record);
    this.store.select(record, true, true);
  }
}
