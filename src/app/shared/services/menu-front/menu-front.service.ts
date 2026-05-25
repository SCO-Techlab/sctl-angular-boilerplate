import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IPaginationQuery, IPaginationResponse } from '@core/shared/interfaces';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { IMenuFront } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuFrontService {

  private http = inject(HttpClient);

  find(filter: Partial<IMenuFront>, pagination?: IPaginationQuery): Observable<IMenuFront[] | IPaginationResponse<IMenuFront>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<IMenuFront[] | IPaginationResponse<IMenuFront>>(`${environment.apiUrl}/menu-front`, { params: httpParams });
  }

  save(menuFront: IMenuFront): Observable<IMenuFront> {
    return this.http.post<IMenuFront>(`${environment.apiUrl}/menu-front`, menuFront);
  }

  update(_id: string, menuFront: IMenuFront): Observable<IMenuFront> {
    return this.http.put<IMenuFront>(`${environment.apiUrl}/menu-front/${_id}`, menuFront);
  }

  delete(menuFront: IMenuFront): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/menu-front/${menuFront._id}`);
  }

  deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/menu-front/delete/bulk`, { body });
  }

  getUserMenuFront(_id: string): Observable<IMenuFront[]> {
    return this.http.get<IMenuFront[]>(`${environment.apiUrl}/profile/get/user/menu-front/${_id}`);
  }

  filterMenuItems(items: IMenuFront[], userRole: string): IMenuFront[] {
    if (!items?.length) {
      return null;
    }

    return items
      .filter(item => {
        if (!item.roles || !item.roles.length) {
          return true;
        }

        const upperRoles: string[] = (item.roles as string[]).map((role: string) => role.toUpperCase());
        if (!upperRoles.length) {
          return true;
        }

        return upperRoles.includes(userRole);
      })
      .map(item => ({
        ...item,
        items: this.filterMenuItems(item.items, userRole)
      }));
  }
}
