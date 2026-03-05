import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IAuthEvent } from '@modules/auth/interfaces';
import { Store } from '@ngxs/store';
import { SessionStorageState, SetAccessToken, SetRememberUser } from '@session-storage';
import { IJwtPayload, IJwtToken, IUser } from '@shared/interfaces';
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
    this.store.dispatch(new SetRememberUser({
      rememberUser: !event.rememberMe
        ? undefined
        : { email: event.email, password: event.password },
    }));
    this.router.navigate(['/']);
  }

  public logout(reason?: string): void {
    this.store.dispatch(new SetAccessToken({ accessToken: undefined }));
    this.router.navigate(
      ['/auth/login'],
      { queryParams: { reason: reason ?? 'signout' } }
    );
  }

  public isLoggedIn(): boolean {
    return !!this.getUser();
  }

  public loggedUser(): IUser {
    return this.getUser();
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
