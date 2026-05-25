import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IPaginationQuery, IPaginationResponse } from '@core/shared/interfaces';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { IUser } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(HttpClient);

  find(filter: Partial<IUser>, pagination?: IPaginationQuery): Observable<IUser[] | IPaginationResponse<IUser>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<IUser[] | IPaginationResponse<IUser>>(`${environment.apiUrl}/users`, { params: httpParams });
  }

  save(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(`${environment.apiUrl}/users`, user);
  }

  update(_id: string, user: IUser): Observable<IUser> {
    return this.http.put<IUser>(`${environment.apiUrl}/users/${_id}`, user);
  }

  updatePassword(_id: string, password: string): Observable<boolean> {
    const body = { password, newPassword: password };
    return this.http.put<boolean>(`${environment.apiUrl}/users/password/${_id}`, body);
  }

  deleteAvatar(_id: string): Observable<boolean> {
    return this.http.put<boolean>(`${environment.apiUrl}/users/delete/avatar/${_id}`, {});
  }

  delete(user: IUser): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/users/${user._id}`);
  }

  deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/users/delete/bulk`, { body });
  }

  sendWelcomeEmail(_id: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.apiUrl}/users/send/welcome/email/${_id}`);
  }
}
