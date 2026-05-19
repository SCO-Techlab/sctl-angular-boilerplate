import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { IPaginationQuery, IPaginationResponse } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { ISession } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {

  private http = inject(HttpClient);

  find(filter: Partial<ISession>, pagination?: IPaginationQuery): Observable<ISession[] | IPaginationResponse<ISession>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<ISession[] | IPaginationResponse<ISession>>(`${environment.apiUrl}/sessions`, { params: httpParams });
  }

  revoke(_id: string): Observable<ISession> {
    return this.http.put<ISession>(`${environment.apiUrl}/sessions/revoke/${_id}`, {});
  }

  delete(session: ISession): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/sessions/${session._id}`);
  }

  deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/sessions/delete/bulk`, { body });
  }
}
