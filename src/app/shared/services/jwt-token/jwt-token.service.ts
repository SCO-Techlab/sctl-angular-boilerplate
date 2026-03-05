import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@shared/constants';
import { IJwtPayload } from '@shared/interfaces';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtTokenService {

  public decodeToken(token?: string): IJwtPayload {
    if (!token) {
      return undefined;
    }

    const decoded = jwtDecode<IJwtPayload>(token);
    return decoded ?? undefined;
  }

  public isTokenExpired(token?: string): boolean {
    if (!token) {
      return true;
    }

    const decoded = this.decodeToken(token);
    if (!decoded || decoded.exp === undefined) {
      return true;
    }

    const now = Date.now() / MAGIC_NUMBERS.N_1000;
    return decoded.exp < now;
  }

}
