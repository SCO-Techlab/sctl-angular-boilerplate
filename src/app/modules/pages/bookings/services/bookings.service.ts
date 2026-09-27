import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment';
import { Observable } from 'rxjs';
import { IBookingCalendar } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {

  private readonly http = inject(HttpClient);

  public getBookingsCalendar(): Observable<IBookingCalendar> {
    return this.http.get<IBookingCalendar>(`${environment.apiUrl}/bookings/bookings/calendar`);
  }
}
