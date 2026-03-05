import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { JwtTokenService, UserService } from '@shared/services';
import { SessionStorageState } from 'src/app/session-storage';

export function AuthInitializer(): () => void {
  return () => {

    const store = inject(Store);
    const jwtTokenService = inject(JwtTokenService);
    const userService = inject(UserService);

    const accessToken: string = store.selectSnapshot(SessionStorageState.accessToken);
    if (!accessToken) {
      return;
    }

    if (jwtTokenService.isTokenExpired(accessToken)) {
      userService.logout('expired');
    }
  };
}