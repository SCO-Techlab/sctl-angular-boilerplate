import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoaderComponent } from '@core/components';
import { MAGIC_NUMBERS, TranslateModule, TranslateService } from '@core/shared';
import { CalendarOptions, DateSelectInfo, EventClickInfo, FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import listPlugin from '@fullcalendar/angular/list';
import themePlugin from '@fullcalendar/angular/themes/classic';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import { IResidence } from '@shared/interfaces';
import { SelectTenantService } from '@shared/services';
import { timer } from 'rxjs';
import { BookingsCalendarSidebarComponent } from '../../components';
import { IBookingCalendar } from '../../interfaces';
import { BookingsService } from '../../services';
import { createEventId, INITIAL_EVENTS } from './bookin-calendar.utils';

@Component({
  selector: 'sctl-bookings-calendar',
  standalone: true,
  templateUrl: './bookings-calendar.component.html',
  styleUrls: ['./bookings-calendar.component.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    FullCalendarModule,
    BookingsCalendarSidebarComponent,
    LoaderComponent,
  ]
})
export class BookingsCalendarComponent implements OnInit {

  @ViewChild('calendar') calendar: FullCalendarComponent;

  public calendarDate = signal<Date>(null);
  public calendarVisible = signal<boolean>(false);
  public calendarOptions = signal<CalendarOptions>(null);

  public bookingCalendar = signal<IBookingCalendar>(null);
  public selectedResidence = signal<IResidence>(null);

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly selectTenantService = inject(SelectTenantService);
  private readonly bookingsService = inject(BookingsService);

  ngOnInit(): void {
    this.listenTonSelecTenantChanges();
  }

  public onSelectDateHandler(date: Date): void {
    this.calendarDate.set(date);
    this.calendar.getApi().gotoDate(date);
  }

  public onResidenceChangeHandler(residence: IResidence): void {
    this.selectedResidence.set(residence);
  }

  private listenTonSelecTenantChanges(): void {
    this.selectTenantService.onTenantChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.getBookingCalendar()
      });
  }

  private getBookingCalendar(): void {
    this.bookingsService.getBookingsCalendar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (bookingCalendar: IBookingCalendar) => {
          this.bookingCalendar.set(bookingCalendar);
          this.selectedResidence.set(bookingCalendar?.residences?.[MAGIC_NUMBERS.N_0] ?? null);
          this.initCalendar();
        }
      });
  }

  private initCalendar(): void {
    this.calendarDate.set(new Date());
    this.calendarVisible.set(false);
    this.calendarOptions.set({
      locale: this.translateService.currentLang,
      height: '100%',
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, themePlugin],
      headerToolbar: { left: '', center: 'title', right: '' },
      initialDate: this.calendarDate(),
      initialView: this.selectedResidence()?.calendar?.calendarType,
      initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      firstDay: MAGIC_NUMBERS.N_1,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      //eventsSet: this.setCalendarEvents.bind(this)
      /* you can update a remote database when these fire: eventAdd: eventChange: eventRemove: */
    });
    timer(MAGIC_NUMBERS.N_1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.calendarVisible.set(true));
  }

  // FC
  handleDateSelect(selectInfo: DateSelectInfo) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }

  handleEventClick(clickInfo: EventClickInfo) {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }
  }
}
