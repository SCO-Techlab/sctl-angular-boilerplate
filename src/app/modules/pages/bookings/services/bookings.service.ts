import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IPaginationQuery, IPaginationResponse } from '@core/shared/interfaces';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { Observable } from 'rxjs';
import { IBooking, IBookingCalendar } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {

  private readonly http = inject(HttpClient);

  public getBookingsCalendar(): Observable<IBookingCalendar> {
    return this.http.get<IBookingCalendar>(`${environment.apiUrl}/bookings/bookings/calendar`);
  }

  public find(filter: Partial<IBooking>, pagination?: IPaginationQuery): Observable<IBooking[] | IPaginationResponse<IBooking>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<IBooking[] | IPaginationResponse<IBooking>>(`${environment.apiUrl}/bookings`, { params: httpParams });
  }

  public findOne(_id: string): Observable<IBooking> {
    return this.http.get<IBooking>(`${environment.apiUrl}/bookings/${_id}`);
  }

  public save(booking: IBooking): Observable<IBooking> {
    const body = this.mapToRequestBody(booking);
    return this.http.post<IBooking>(`${environment.apiUrl}/bookings`, body);
  }

  public update(_id: string, booking: IBooking): Observable<IBooking> {
    const body = this.mapToRequestBody(booking);
    return this.http.put<IBooking>(`${environment.apiUrl}/bookings/${_id}`, body);
  }

  public updateMultiple(_ids: string[], data: Partial<IBooking>): Observable<number> {
    const body = { _ids, data };
    return this.http.put<number>(`${environment.apiUrl}/bookings/update/bulk`, body);
  }

  public delete(booking: IBooking): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/bookings/${booking._id}`);
  }

  public deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/bookings/delete/bulk`, { body });
  }

  private mapToRequestBody(booking: IBooking): Record<string, unknown> {
    return {
      ...booking,
      tenant: this.resolveRelationId(booking?.tenant),
      rooms: booking?.rooms?.map(room => this.resolveRelationId(room)) ?? [],
      customer: this.resolveRelationId(booking?.customer)
    };
  }

  private resolveRelationId(value: string | { _id?: string } | undefined): string {
    if (typeof value === 'string') {
      return value;
    }

    return value?._id ?? '';
  }
}
