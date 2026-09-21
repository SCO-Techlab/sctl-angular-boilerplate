import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IPaginationQuery, IPaginationResponse } from '@core/shared/interfaces';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { Observable } from 'rxjs';
import { IResidence } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ResidencesService {

  private readonly http = inject(HttpClient);

  public find(filter: Partial<IResidence>, pagination?: IPaginationQuery): Observable<IResidence[] | IPaginationResponse<IResidence>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<IResidence[] | IPaginationResponse<IResidence>>(`${environment.apiUrl}/residences`, { params: httpParams });
  }

  public save(residence: IResidence): Observable<IResidence> {
    const body = {
      ...residence,
      tenant: residence.tenant?._id
    };
    return this.http.post<IResidence>(`${environment.apiUrl}/residences`, body);
  }

  public update(_id: string, residence: IResidence): Observable<IResidence> {
    const body = {
      ...residence,
      tenant: residence.tenant?._id
    };
    return this.http.put<IResidence>(`${environment.apiUrl}/residences/${_id}`, body);
  }

  public delete(residence: IResidence): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/residences/${residence._id}`);
  }

  public deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/residences/delete/bulk`, { body });
  }
}
