import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment';
import { IUser } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private http = inject(HttpClient);

  updateUserInfo(_id: string, user: Partial<IUser>): Observable<IUser> {
    const body = { ...user };
    return this.http.put<IUser>(`${environment.apiUrl}/profile/update/user/info/${_id}`, body);
  }
}
