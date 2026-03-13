import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment';
import { IPermission } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  private http = inject(HttpClient);

  find(filter?: Partial<IPermission>): Observable<IPermission[]> {
    return this.http.get<IPermission[]>(`${environment.apiUrl}/permissions`);
  }

  save(permission: IPermission): Observable<IPermission> {
    return this.http.post<IPermission>(`${environment.apiUrl}/permissions`, permission);
  }

  update(_id: string, permission: IPermission): Observable<IPermission> {
    return this.http.put<IPermission>(`${environment.apiUrl}/permissions/${_id}`, permission);
  }

  delete(permission: IPermission): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/permissions/${permission._id}`);
  }

  deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/permissions/delete/bulk`, { body });
  }
}
