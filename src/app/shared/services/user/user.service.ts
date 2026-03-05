import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { JwtTokenService } from '../jwt-token';
import { IJwtPayload, IJwtToken, IUser } from '@shared/interfaces';
import { SessionStorageState, SetRememberUser, SetToken } from '@session-storage';
import { IAuthEvent } from '@modules/auth/interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private store = inject(Store);
  private jwtTokenService = inject(JwtTokenService);
  private router = inject(Router);

  public login(jwtToken: IJwtToken, event: IAuthEvent): void {
    this.store.dispatch(new SetToken({ token: { ...jwtToken } }));
    this.store.dispatch(new SetRememberUser({ rememberUser: !event.rememberMe
      ? undefined
      : { email: event.email, password: event.password },
    }));
    this.router.navigate(['/']);
  }

  public logout(reason?: string): void {
    this.store.dispatch(new SetToken({ token: undefined }));
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
    const token: IJwtToken = this.store.selectSnapshot(SessionStorageState.token);
    if (!token?.accessToken) {
      return undefined;
    }

    const decoded: IJwtPayload = this.jwtTokenService.decodeToken(token.accessToken);
    return decoded?.user ?? undefined;
  }
}
