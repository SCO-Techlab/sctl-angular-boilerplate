import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SetToken } from '@persist-storage';
import { MAGIC_NUMBERS } from '@shared/constants';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {

  const store = inject(Store);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === MAGIC_NUMBERS.N_401) {
        store.dispatch(new SetToken({ token: undefined, delete: true }));
        router.navigate(
          ['/auth/login'],
          {
            queryParams: {
              reason: 'expired'
            }
          }
        );
      }

      return throwError(() => error);
    })
  );
};