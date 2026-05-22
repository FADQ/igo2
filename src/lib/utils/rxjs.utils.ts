import { BehaviorSubject } from "rxjs";

export function isBehaviorSubject<T>(
  value: unknown
): value is BehaviorSubject<T> {

  return !!value
    && typeof value === 'object'
    && 'next' in value;
}
