import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { IJwtToken, IUser } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { ILoginComponentEvent } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private readonly http: HttpClient) { }

  logIn(loginEvent: ILoginComponentEvent): Observable<IJwtToken> {
    const body = { email: loginEvent.email, password: loginEvent.password };
    return this.http.post<IJwtToken>(`${environment.apiUrl}/auth/login`, body);
  }

  refreshToken(email: string, token: string, isAccessToken: boolean): Observable<IJwtToken> {
    const body = { token, isAccessToken };
    return this.http.post<IJwtToken>(`${environment.apiUrl}/auth/refresh/${email}`, body);
  }

  register(user: IUser): Observable<boolean> {
    const body = { 
      email: user.email, 
      userName: user.userName,
      personalName: user.personalName,
      password: user.password,
      active: user.active,
      role: user.role?.name || user.role
    };
    return this.http.post<boolean>(`${environment.apiUrl}/auth/register`, body);
  }

  findUser(email: string): Observable<IUser> {
    return this.http.get<IUser>(`${environment.apiUrl}/auth/find/user/${email}`);
  }

  confirmEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.apiUrl}/auth/confirm/email/${email}`);
  }

  forgotPassword(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.apiUrl}/auth/forgot/password/${email}`);
  }

  passwordRecoveryFind(pwdRecoveryToken: string): Observable<IUser> {
    return this.http.get<IUser>(`${environment.apiUrl}/auth/recover/password/find/${pwdRecoveryToken}`);
  }

  passwordRecoveryReset(userId: string, password: string): Observable<boolean> {
    const body = { userId, password };
    return this.http.put<boolean>(`${environment.apiUrl}/auth/recover/password/reset`, body);
  }
}
