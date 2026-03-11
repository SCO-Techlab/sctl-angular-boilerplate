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

  getUserMenuFront(_id: string): Observable<IMenuFront[]> {
    return this.http.get<IMenuFront[]>(`${environment.apiUrl}/profile/get/user/menu-front/${_id}`);
  }
}
