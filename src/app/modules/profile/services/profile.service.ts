import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from '@environment';
import { IJwtToken, ITenant, IUser } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private readonly http = inject(HttpClient);

  public updateUserInfo(_id: string, user: Partial<IUser>): Observable<IJwtToken> {
    const body = { ...user };
    return this.http.put<IJwtToken>(`${environment.apiUrl}/profile/update/user/info/${_id}`, body);
  }

  public updateUserPassword(_id: string, password: string, newPassword: string): Observable<boolean> {
    const body = { password, newPassword };
    return this.http.put<boolean>(`${environment.apiUrl}/profile/update/user/password/${_id}`, body);
  }

  public updateUserAvatar(_id: string, file: File): Observable<IJwtToken> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<IJwtToken>(`${environment.apiUrl}/profile/update/user/avatar/${_id}`, formData);
  }

  public deleteUserAvatar(_id: string): Observable<IJwtToken> {
    return this.http.delete<IJwtToken>(`${environment.apiUrl}/profile/delete/user/avatar/${_id}`);
  }

  public deleteUserAccount(_id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/profile/delete/user/account/${_id}`);
  }

  public updateUserTenant(_id: string, tenant: Partial<ITenant>): Observable<IJwtToken> {
    const members = tenant?.members?.map(member => member._id);
    const body = { ...tenant, members };
    return this.http.put<IJwtToken>(`${environment.apiUrl}/profile/update/user/tenant/${_id}`, body);
  }

  public updateTenantAvatar(_id: string, _tenantId: string, file: File): Observable<IJwtToken> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<IJwtToken>(`${environment.apiUrl}/profile/update/tenant/avatar/${_id}/${_tenantId}`, formData);
  }

  public deleteTenantAvatar(_id: string, _tenantId: string): Observable<IJwtToken> {
    return this.http.delete<IJwtToken>(`${environment.apiUrl}/profile/delete/tenant/avatar/${_id}/${_tenantId}`);
  }

  public disableOrEnableForm(form: FormGroup, disable: boolean = false): void {
    const action = {
      true: 'disable',
      false: 'enable'
    };

    const controls: string[] = Object.keys(form.controls) || [];
    controls.forEach((control) => form.controls[control][action[`${disable}`]]());
  }
}
