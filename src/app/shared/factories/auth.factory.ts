import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { SessionStorageState, SetToken } from 'src/app/session-storage';
import { JwtTokenService } from '@shared/services';

export function AuthInitializer(): () => void {
  return () => {

    const store = inject(Store);
    const router = inject(Router);
    const jwtTokenService = inject(JwtTokenService);

    const token = store.selectSnapshot(SessionStorageState.token);
    if (!token?.accessToken) {
      return;
    }

    if (jwtTokenService.isTokenExpired(token.accessToken)) {
      store.dispatch(new SetToken({ token: undefined }));
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