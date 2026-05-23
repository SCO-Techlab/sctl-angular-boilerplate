import { Injectable } from '@angular/core';
import { IJwtPayload } from '@shared/interfaces';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtTokenService {

  public decodeToken(token: string): IJwtPayload {
    if (!token) {
      return undefined;
    }

    const decoded = jwtDecode<IJwtPayload>(token);
    return decoded ?? undefined;
  }
}
