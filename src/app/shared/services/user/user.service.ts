import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IAuthEvent } from '@modules/auth/interfaces';
import { Store } from '@ngxs/store';
import { SessionStorageState, SetAccessToken, SetRefreshToken, SetRememberUser } from '@session-storage';
import { PERMISSION_TYPE } from '@shared/enums';
import { IJwtPayload, IJwtToken, IPermission, IUser } from '@shared/interfaces';
import { JwtTokenService } from '../jwt-token';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private store = inject(Store);
  private jwtTokenService = inject(JwtTokenService);
  private router = inject(Router);

  public login(jwtToken: IJwtToken, event: IAuthEvent): void {
    this.store.dispatch(new SetAccessToken({ accessToken: jwtToken?.accessToken }));
    this.store.dispatch(new SetRefreshToken({
      refreshToken: jwtToken?.refreshToken && event?.rememberMe
        ? jwtToken?.refreshToken
        : undefined
    }));
    this.store.dispatch(new SetRememberUser({ rememberUser: event?.rememberMe ? event?.email : undefined }));
    this.router.navigate(['/']);
  }

  public logout(params: { reason?: string; deleteRefreshToken?: boolean }): void {
    this.store.dispatch(new SetAccessToken({ accessToken: undefined }));

    if (params?.deleteRefreshToken) {
      this.store.dispatch(new SetRefreshToken({ refreshToken: undefined }));
    }

    this.router.navigate(
      ['/auth/login'],
      { queryParams: { reason: params?.reason ?? 'signout' } }
    );
  }

  public isLoggedIn(): boolean {
    return !!this.getUser();
  }

  public loggedUser(): IUser {
    return this.getUser();
  }

  public hasPermission(name: string, type: PERMISSION_TYPE): boolean {
    const user: IUser = this.getUser();
    if (!user) {
      return false;
    }

    if (!user.role?.permissions?.length) {
      return false;
    }

    const permission: IPermission | string = user.role.permissions.find((p: IPermission) => p.name === name && p.type === type);
    if (!permission) {
      return false;
    }

    return true;
  }

  private getUser(): IUser {
    const accessToken: string = this.store.selectSnapshot(SessionStorageState.accessToken);
    if (!accessToken) {
      return undefined;
    }

    const decoded: IJwtPayload = this.jwtTokenService.decodeToken(accessToken);
    return decoded?.user ?? undefined;
  }
}
