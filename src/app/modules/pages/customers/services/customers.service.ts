import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IPaginationQuery, IPaginationResponse } from '@core/shared/interfaces';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { ICustomer } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  private readonly http = inject(HttpClient);

  public find(filter: Partial<ICustomer>, pagination?: IPaginationQuery): Observable<ICustomer[] | IPaginationResponse<ICustomer>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<ICustomer[] | IPaginationResponse<ICustomer>>(`${environment.apiUrl}/customers`, { params: httpParams });
  }

  public save(customer: ICustomer): Observable<ICustomer> {
    const body = {
      ...customer,
      tenant: customer.tenant?._id
    };
    return this.http.post<ICustomer>(`${environment.apiUrl}/customers`, body);
  }

  public update(_id: string, customer: ICustomer): Observable<ICustomer> {
    const body = {
      ...customer,
      tenant: customer.tenant?._id
    };
    return this.http.put<ICustomer>(`${environment.apiUrl}/customers/${_id}`, body);
  }

  public delete(customer: ICustomer): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/customers/${customer._id}`);
  }

  public deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/customers/delete/bulk`, { body });
  }
}
