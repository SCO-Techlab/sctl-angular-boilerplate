import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { ILoginComponentEvent } from '../interfaces';
import { IJwtToken } from '@shared/interfaces';

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
}
