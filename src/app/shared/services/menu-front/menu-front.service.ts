import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment';
import { IMenuFront } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuFrontService {

  private http = inject(HttpClient);

  find(filter?: Partial<IMenuFront>): Observable<IMenuFront[]> {
    return this.http.get<IMenuFront[]>(`${environment.apiUrl}/menu-front`);
  }

  save(menuFront: IMenuFront): Observable<IMenuFront> {
    return this.http.post<IMenuFront>(`${environment.apiUrl}/menu-front`, menuFront);
  }

  update(menuFront: IMenuFront): Observable<IMenuFront> {
    return this.http.put<IMenuFront>(`${environment.apiUrl}/menu-front/${menuFront._id}`, menuFront);
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
}
