import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { PersistStorageState } from '@persist-storage';
import { IJwtToken } from '@shared/interfaces';
import { JwtTokenService } from '@shared/services';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly store: Store,
    private readonly router: Router,
    private readonly jwtTokenService: JwtTokenService,
  ) { }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const token: IJwtToken = this.store.selectSnapshot(PersistStorageState.token);
    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const tokenExpired: boolean = this.jwtTokenService.isTokenExpired(token.accessToken);
    if (tokenExpired) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}
