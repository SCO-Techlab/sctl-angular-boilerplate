import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@shared/constants';
import { IAuthPayload } from '@shared/interfaces';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtTokenService {

  decodeToken(token?: string): IAuthPayload {
    if (!token) {
      return undefined;
    }

    const decoded = jwtDecode<IAuthPayload>(token);
    return decoded ?? undefined;
  }

  isTokenExpired(token?: string): boolean {
    if (!token) {
      return true;
    }

    const decoded = jwtDecode<IAuthPayload>(token);
    if (!decoded || decoded.exp === undefined) {
      return true;
    }

    const now = Date.now() / MAGIC_NUMBERS.N_1000;
    return decoded.exp < now;
  }

}
