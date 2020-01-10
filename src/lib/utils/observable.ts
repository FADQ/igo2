import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export function every(...observables: Observable<boolean>[]): Observable<boolean> {
  return combineLatest(observables).pipe(
    map((bunch: boolean[]) => bunch.every(Boolean))
  );
}
