import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAGIC_NUMBERS, TranslateModule, TranslateService } from '@core/shared';
import { CalendarOptions, DateSelectInfo, EventApi, EventClickInfo, FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import listPlugin from '@fullcalendar/angular/list';
import themePlugin from '@fullcalendar/angular/themes/classic';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import { timer } from 'rxjs';
import { BookingsCalendarSidebarComponent } from '../../components';
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
    BookingsCalendarSidebarComponent
  ]
})
export class BookingsCalendarComponent implements OnInit {

  @ViewChild('calendar') calendar: FullCalendarComponent;

  public calendarDate = signal<Date>(null);
  public calendarVisible = signal<boolean>(false);
  public calendarOptions = signal<CalendarOptions>(null);

  private calendarEvents = signal<EventApi[]>([]);

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);

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

  ngOnInit(): void {
    this.calendarDate.set(new Date());
    this.calendarVisible.set(false);
    this.calendarOptions.set({
      locale: this.translateService.currentLang,
      height: '100%',
      plugins: [
        interactionPlugin,
        dayGridPlugin,
        timeGridPlugin,
        listPlugin,
        themePlugin,
      ],
      headerToolbar: {
        left: '',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      initialDate: this.calendarDate(),
      initialView: 'dayGridMonth',
      initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.setCalendarEvents.bind(this)
      /* you can update a remote database when these fire:
      eventAdd:
      eventChange:
      eventRemove:
      */
    });
    timer(MAGIC_NUMBERS.N_1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.calendarVisible.set(true));
  }

  public onSelectDateHandler(date: Date): void {
    this.calendarDate.set(date);
    this.calendar.getApi().gotoDate(date);
  }

  private setCalendarEvents(events: EventApi[]): void {
    this.calendarEvents.set(events);
  }
}
