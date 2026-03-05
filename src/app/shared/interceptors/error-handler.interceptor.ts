import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MAGIC_NUMBERS } from '@shared/constants';
import { UserService } from '@shared/services';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const ErrorHandlerInterceptor: HttpInterceptorFn = (req, next) => {

  const userService = inject(UserService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === MAGIC_NUMBERS.N_401) {
        userService.logout('expired');
      }

      return throwError(() => error);
    })
  );
};