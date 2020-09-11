import { BehaviorSubject, Observable, Subscription, of, combineLatest } from 'rxjs';
import { switchMap, tap, finalize, catchError } from 'rxjs/operators';

export enum SubmitStep {
  Idle = 'Idle',
  Pending = 'Pending',
  Complete = 'Complete'
}

export enum SubmitStatus {
  Unknown = 'Unknown',
  Success = 'Success',
  Error = 'Error'
}

export class SubmitError<T = any> extends Error {

  readonly source: T;

  constructor(source: T) {
    super();
    Object.setPrototypeOf(this, SubmitError.prototype);
    this.source = source;
  }
}

export type SubmitSuccessHandlerFunc<T> = (result: T) => void;
export type SubmitErrorHandlerFunc = (error: SubmitError) => void;

export interface SubmitHandlerFuncs<T> {
  error?: SubmitErrorHandlerFunc;
  success?: SubmitSuccessHandlerFunc<T>;
}

export class SubmitHandler<T = unknown> {

  readonly step$: BehaviorSubject<SubmitStep> = new BehaviorSubject(SubmitStep.Idle);

  readonly status$: BehaviorSubject<SubmitStatus> = new BehaviorSubject(SubmitStatus.Unknown);

  readonly state$: Observable<[SubmitStep, SubmitStatus]> = combineLatest([this.step$, this.status$]);

  private wrapped$: Observable<T | SubmitError>;

  private wrapped$$: Subscription;

  private handlerFuncs: SubmitHandlerFuncs<T>;

  handle(wrapped$: Observable<T>, handlerFuncs: SubmitHandlerFuncs<T> = {}): SubmitHandler<T> {
    this.initState();
    this.handlerFuncs = handlerFuncs;
    this.wrapped$ = of(null)
      .pipe(
        tap(() => this.setStep(SubmitStep.Pending)),
        switchMap(() => wrapped$),
        catchError((error: unknown) => {
          const submitError = new SubmitError(error);
          if (this.handlerFuncs.error !== undefined) {
            this.handlerFuncs.error(submitError);
          }
          this.setStatus(SubmitStatus.Error);
          return of(submitError);
        }),
        tap((response: T | SubmitError) => {
          if (response instanceof SubmitError) {
            return;
          }

          if (this.handlerFuncs.success !== undefined) {
            this.handlerFuncs.success(response);
          }
          this.setStatus(SubmitStatus.Success);
        }),
        finalize(() => {
          this.setStep(SubmitStep.Complete);
        })
      );

    return this;
  }

  submit() {
    if (this.wrapped$ === undefined) {
      throw new Error('This SubmitHandler is not bound to and observable.');
    }

    if (this.wrapped$$ !== undefined) {
      this.wrapped$$.unsubscribe();
    }

    this.wrapped$$ = this.wrapped$.subscribe();
  }

  destroy() {
    if (this.wrapped$$ !== undefined) {
      this.wrapped$$.unsubscribe();
    }
  }

  private initState() {
    this.setStep(SubmitStep.Idle);
    this.setStatus(SubmitStatus.Unknown);
  }

  private setStep(step: SubmitStep) {
    this.step$.next(step);
  }

  private setStatus(status: SubmitStatus) {
    this.status$.next(status);
  }

}
