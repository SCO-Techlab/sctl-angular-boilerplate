import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SessionStorageState } from '@session-storage';
import { IJwtToken } from '@shared/interfaces';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly store: Store,
    private readonly router: Router
  ) { }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const token: IJwtToken = this.store.selectSnapshot(SessionStorageState.token);
    if (!token) {
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
