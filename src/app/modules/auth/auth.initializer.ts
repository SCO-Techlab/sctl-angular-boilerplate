import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { PersistStorageState, SetToken } from '@persist-storage';
import { JwtTokenService } from '@shared/services';

export function authInitializer(): () => void {
  return () => {

    const store = inject(Store);
    const router = inject(Router);
    const jwtTokenService = inject(JwtTokenService);

    const token = store.selectSnapshot(PersistStorageState.token);
    if (!token?.accessToken) {
      return;
    }

    if (jwtTokenService.isTokenExpired(token.accessToken)) {
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
  };
}