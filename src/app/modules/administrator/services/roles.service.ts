import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { IPaginationQuery, IPaginationResponse, IRole } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private http = inject(HttpClient);

  find(filter: Partial<IRole>, pagination?: IPaginationQuery): Observable<IRole[] | IPaginationResponse<IRole>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<IRole[] | IPaginationResponse<IRole>>(`${environment.apiUrl}/roles`, { params: httpParams });
  }

  save(role: IRole): Observable<IRole> {
    return this.http.post<IRole>(`${environment.apiUrl}/roles`, role);
  }

  update(_id: string, role: IRole): Observable<IRole> {
    return this.http.put<IRole>(`${environment.apiUrl}/roles/${_id}`, role);
  }

  delete(role: IRole): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/roles/${role._id}`);
  }

  deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/roles/delete/bulk`, { body });
  }
}
