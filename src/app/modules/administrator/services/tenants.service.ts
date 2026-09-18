import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IPaginationQuery, IPaginationResponse } from '@core/shared/interfaces';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { ITenant } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TenantsService {

  private readonly http = inject(HttpClient);

  public find(filter: Partial<ITenant>, pagination?: IPaginationQuery): Observable<ITenant[] | IPaginationResponse<ITenant>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<ITenant[] | IPaginationResponse<ITenant>>(`${environment.apiUrl}/tenants`, { params: httpParams });
  }

  public save(tenant: ITenant): Observable<ITenant> {
    return this.http.post<ITenant>(`${environment.apiUrl}/tenants`, tenant);
  }

  public update(_id: string, tenant: ITenant): Observable<ITenant> {
    return this.http.put<ITenant>(`${environment.apiUrl}/tenants/${_id}`, tenant);
  }

  public delete(tenant: ITenant): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/tenants/${tenant._id}`);
  }

  public deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/tenants/delete/bulk`, { body });
  }

  public deleteTenantAvatar(_id: string): Observable<boolean> {
    return this.http.put<boolean>(`${environment.apiUrl}/tenants/delete/avatar/${_id}`, {});
  }
}
