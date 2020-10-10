import {Observable, of} from 'rxjs';
import {catchError, map, startWith} from 'rxjs/operators';

export enum ObservableStatus
{
    SUCCESS,
    ERROR,
    LOADING
}

export interface ObservableWithStatus<T>
{
    status: ObservableStatus;
    value: T;
    error: Error;
}

export function wrapObservableWithStatus<T>(observable: Observable<T>): Observable<ObservableWithStatus<T>>
{
    return observable.pipe(
        map(value => ({status: ObservableStatus.SUCCESS, value, error: null})),
        startWith({status: ObservableStatus.LOADING, value: null, error: null}),
        catchError((err: Error) => {
            return of({status: ObservableStatus.ERROR, value: null, error: err});
        })
    );
}
