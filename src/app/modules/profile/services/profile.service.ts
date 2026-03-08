import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from '@environment';
import { IJwtToken, IUser } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private http = inject(HttpClient);

  updateUserInfo(_id: string, user: Partial<IUser>): Observable<IJwtToken> {
    const body = { ...user };
    return this.http.put<IJwtToken>(`${environment.apiUrl}/profile/update/user/info/${_id}`, body);
  }

  updateUserPassword(_id: string, password: string, newPassword: string): Observable<boolean> {
    const body = { password, newPassword };
    return this.http.put<boolean>(`${environment.apiUrl}/profile/update/user/password/${_id}`, body);
  }

  updateUserAvatar(_id: string, file: File): Observable<IJwtToken> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<IJwtToken>(`${environment.apiUrl}/profile/update/user/avatar/${_id}`, formData);
  }

  deleteUserAccount(_id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/profile/delete/user/account/${_id}`);
  }

  disableOrEnableForm(form: FormGroup, disable: boolean = false): void {
    const action = {
      true: 'disable',
      false: 'enable'
    };

    const controls: string[] = Object.keys(form.controls) || [];
    controls.forEach((control) => form.controls[control][action[`${disable}`]]());
  }
}
