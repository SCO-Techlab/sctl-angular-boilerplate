import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { ITenantImages } from '../interfaces/images.interface';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  private readonly http = inject(HttpClient);

  public getTenantImages(userId: string): Observable<ITenantImages> {
    return this.http.get<ITenantImages>(`${environment.apiUrl}/images/tenant/${userId}`);
  }
}
