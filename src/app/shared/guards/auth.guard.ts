import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { SessionStorageState } from '@core/session-storage';
import { Store } from '@ngxs/store';

@Injectable()
export class AuthGuard implements CanActivate {

  private store = inject(Store);
  private router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const accessToken: string = this.store.selectSnapshot(SessionStorageState.accessToken);
    if (!accessToken) {
      this.router.navigate(
        ['/auth/login'],
        {
          queryParams: {
            reason: 'expired'
          }
        }
      );
      return false;
    }

    return true;
  }
}
