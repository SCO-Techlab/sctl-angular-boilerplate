import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IPaginationQuery, IPaginationResponse } from '@core/shared/interfaces';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { IPermission } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  private readonly http = inject(HttpClient);

  public find(filter: Partial<IPermission>, pagination?: IPaginationQuery): Observable<IPermission[] | IPaginationResponse<IPermission>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<IPermission[] | IPaginationResponse<IPermission>>(`${environment.apiUrl}/permissions`, { params: httpParams });
  }

  public save(permission: IPermission): Observable<IPermission> {
    return this.http.post<IPermission>(`${environment.apiUrl}/permissions`, permission);
  }

  public update(_id: string, permission: IPermission): Observable<IPermission> {
    return this.http.put<IPermission>(`${environment.apiUrl}/permissions/${_id}`, permission);
  }

  public delete(permission: IPermission): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/permissions/${permission._id}`);
  }

  public deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/permissions/delete/bulk`, { body });
  }
}
