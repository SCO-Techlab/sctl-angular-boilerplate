import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoaderComponent } from '@core/components';
import { BUTTON_SEVERITY, ConfirmDialogService, DatesService, IDialogComponent, ITranslateLiterals, MAGIC_NUMBERS, SpinnerService, ToastService, TranslateModule, TranslateService } from '@core/shared';
import { CalendarOptions, DateSelectInfo, EventClickInfo, FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import interactionPlugin from '@fullcalendar/angular/interaction';
import listPlugin from '@fullcalendar/angular/list';
import multiMonthPlugin from '@fullcalendar/angular/multimonth';
import themePlugin from '@fullcalendar/angular/themes/classic';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import { RESIDENCES_CALENDAR_TYPE } from '@shared/enums';
import { IResidence } from '@shared/interfaces';
import { SelectTenantService } from '@shared/services';
import { finalize, timer } from 'rxjs';
import { BookingFormDialogComponent, BookingsCalendarSidebarComponent } from '../../components';
import { IBooking, IBookingCalendar } from '../../interfaces';
import { BookingsService } from '../../services';

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
    BookingFormDialogComponent,
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
  public selectedBooking = signal<IBooking>(null);
  public selectedResidenceRooms = computed(() => this.bookingCalendar()?.rooms?.filter(room => room.residence?._id === this.selectedResidence()?._id) ?? []);
  public selectedResidenceBookings = computed(() => this.bookingCalendar()?.bookings?.filter(booking => booking.rooms?.some(room => room.residence?._id === this.selectedResidence()?._id)) ?? []);
  public tenantCustomers = computed(() => this.bookingCalendar()?.customers?.filter(customer => customer.tenant?._id === this.selectTenantService.selectedTenant) ?? []);

  public isEdit = signal<boolean>(false);
  public showBookingFormDialog = signal<boolean>(false);
  public bookingFormDialogConfig = signal<IDialogComponent>(null);

  private literals: ITranslateLiterals;

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly selectTenantService = inject(SelectTenantService);
  private readonly bookingsService = inject(BookingsService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly datesService = inject(DatesService);

  ngOnInit(): void {
    this.translateService.stream('PAGES.BOOKINGS')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((literals: ITranslateLiterals) => {
        this.literals = literals;
        this.listenToSelecTenantChanges();
      });
  }

  public onSelectDateHandler(date: Date): void {
    this.calendarDate.set(date);
    this.calendar.getApi().gotoDate(date);
  }

  public onResidenceChangeHandler(residence: IResidence): void {
    this.selectedResidence.set(residence);
    this.initCalendar();
  }

  public onNewBookingHandler(value: IBooking): void {
    if (this.isEdit()) {
      this.onEditBooking(value);
      return;
    }

    value = {
      ...value,
      tenant: {
        _id: this.selectTenantService.selectedTenant
      } as any
    };

    this.spinnerService.show();
    this.bookingsService.save(value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (value: IBooking) => {
          if (!value) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['NEW_BOOKING_KO']
            });
            return;
          }

          this.showBookingFormDialog.set(false);
          this.getBookingCalendar();
          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['NEW_BOOKING_OK']
          });
        },
        error: (error: HttpErrorResponse) => {
          const detail = this.formatNewOrEditBookingError(error, false);
          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail });
        }
      });
  }

  public onEditBooking(value: IBooking): void {
    this.spinnerService.show();
    this.bookingsService.update(value._id, value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (value: IBooking) => {
          if (!value) {
            this.toastService.error({
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals?.['EDIT_BOOKING_KO']
            });
            return;
          }

          this.showBookingFormDialog.set(false);
          this.getBookingCalendar();
          this.toastService.success({
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals?.['EDIT_BOOKING_OK']
          });
        },
        error: (error: HttpErrorResponse) => {
          const detail = this.formatNewOrEditBookingError(error, true);
          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail });
        }
      });
  }

  public deleteBookingHandler(value: IBooking): void {
    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE']?.['HEADER'],
      message: `${this.literals?.['DELETE']?.['MESSAGE']}<br><br><center>${value.customer?.name} - ${value.rooms?.map(room => room.name).join(', ')}</center>`,
      rejectButton: { label: this.literals?.['DELETE']?.['CANCEL'] },
      acceptButton: { label: this.literals?.['DELETE']?.['SUBMIT'] },
      accept: () => {
        this.spinnerService.show();
        this.bookingsService.delete(value)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => {
              this.showBookingFormDialog.set(false);
              this.spinnerService.hide();
            })
          )
          .subscribe({
            next: () => {
              this.getBookingCalendar();
              this.toastService.success({
                summary: this.translateService.instant('TOAST.SUCCESS'),
                detail: this.literals?.['DELETE_BOOKING_OK']
              });
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: this.literals?.['DELETE_BOOKING_KO']
              });
            }
          });
      }, reject: () => {
        this.showBookingFormDialog.set(false);
      }
    });
  }

  public onSidebarNewBooking(): void {
    this.selectedBooking.set({
      _id: null,
      tenant: null,
      rooms: [],
      totalCustomers: MAGIC_NUMBERS.N_1,
      customer: null,
      start: '',
      end: '',
      comment: ''
    });
    this.isEdit.set(false);
    this.initBookingFormDialog();
  }

  private listenToSelecTenantChanges(): void {
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
          if (!this.selectedResidence()?._id || this.selectedResidence()?.tenant?._id !== this.selectTenantService.selectedTenant) {
            this.selectedResidence.set(bookingCalendar?.residences?.[MAGIC_NUMBERS.N_0] ?? null);
          }
          this.initCalendar();
        }
      });
  }

  private initCalendar(): void {
    this.calendarDate.set(new Date());
    this.calendarVisible.set(false);
    this.calendarOptions.set({
      timeZone: 'Europe/Madrid',
      locale: this.translateService.currentLang,
      allDayText: this.literals?.['ALL_DAY_TEXT'],
      height: '100%',
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin, themePlugin],
      headerToolbar: { left: '', center: 'title', right: '' },
      initialDate: this.calendarDate(),
      initialView: this.selectedResidence()?.calendar?.calendarType,
      initialEvents: this.selectedResidenceBookings()?.map(booking => ({
        id: booking._id,
        title: `${booking.rooms?.map(room => room.name).join(', ')} - ${booking.customer?.name} (${booking.totalCustomers})`,
        start: booking.start,
        end: booking.end,
        allDay: false
      })),
      eventDisplay: 'block',
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      allDaySlot: true,
      displayEventTime: false,
      weekNumbers: this.selectedResidence()?.calendar?.weekNumber,
      weekTextShort: this.literals?.['WEEK_TEXT_SHORT'],
      weekends: this.selectedResidence()?.calendar?.showWeekends,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      firstDay: MAGIC_NUMBERS.N_1,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventDrop: this.handleEventDrop.bind(this),
      eventResize: this.handleEventResize.bind(this),
      //eventsSet: this.setCalendarEvents.bind(this)
      /* you can update a remote database when these fire: eventAdd: eventChange: eventRemove: */
    });
    timer(MAGIC_NUMBERS.N_300)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.calendarVisible.set(true));
  }

  private initBookingFormDialog(edit: boolean = false): void {
    this.bookingFormDialogConfig.set({
      closeOnSubmit: false,
      fullScreen: false,
      header: {
        closable: true,
        title: edit ? this.literals?.['EDIT_BOOKING'] : this.literals?.['NEW_BOOKING'],
        subTitle: edit ? `${this.selectedBooking()?.customer?.name} - ${this.selectedBooking()?.rooms?.map(room => room.name).join(', ')}` : '',
      },
      footer: {
        cancelButton: {
          show: true,
          label: this.translateService.instant('COMMON.CLOSE'),
          severity: BUTTON_SEVERITY.SECONDARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        },
        submitButton: {
          show: true,
          label: this.translateService.instant('COMMON.UPDATE'),
          severity: BUTTON_SEVERITY.PRIMARY,
          outlined: true,
          text: false,
          rounded: false,
          disabled: undefined
        }
      }
    });
    this.showBookingFormDialog.set(true);
  }

  private formatNewOrEditBookingError(error: HttpErrorResponse, update: boolean): string {
    let detail = !update
      ? this.literals?.['NEW_BOOKING_KO']
      : this.literals?.['EDIT_BOOKING_KO'];

    if (error?.error?.message === 'Booking end must be after booking start') {
      detail = this.literals?.['BOOKING_END_MUST_BE_AFTER_START'];
    } else if (error?.error?.message.includes('is not available for the selected dates')) {
      detail = this.literals?.['BOOKING_NOT_AVAILABLE'];
      const roomName = error?.error?.message.split(' ')[MAGIC_NUMBERS.N_1];
      const roomBeds = error?.error?.message.split(' ')[MAGIC_NUMBERS.N_4];
      detail = detail?.replace('{room}', roomName)?.replace('{beds}', roomBeds);
    }

    return detail;
  }

  // FC
  handleDateSelect(selectInfo: DateSelectInfo) {
    const fullDaySelection = selectInfo.allDay && selectInfo.view.type !== RESIDENCES_CALENDAR_TYPE.LIST_WEEK;
    const start = fullDaySelection
      ? `${selectInfo.startStr.slice(MAGIC_NUMBERS.N_0, MAGIC_NUMBERS.N_10)}T00:00:00`
      : this.datesService.toLocalDateTime(selectInfo.startStr);

    let end = this.datesService.toLocalDateTime(selectInfo.endStr);
    if (fullDaySelection) {
      const endDate = new Date(`${selectInfo.endStr.slice(MAGIC_NUMBERS.N_0, MAGIC_NUMBERS.N_10)}T00:00:00`);
      endDate.setDate(endDate.getDate() - MAGIC_NUMBERS.N_1);
      endDate.setHours(MAGIC_NUMBERS.N_23, MAGIC_NUMBERS.N_59, MAGIC_NUMBERS.N_0, MAGIC_NUMBERS.N_0);
      end = this.datesService.formatLocalDateTime(endDate);
    }

    this.selectedBooking.set({
      _id: null,
      tenant: null,
      rooms: [],
      totalCustomers: MAGIC_NUMBERS.N_1,
      customer: null,
      start,
      end,
      comment: ''
    });
    this.isEdit.set(false);
    this.initBookingFormDialog();
  }

  handleEventClick(clickInfo: EventClickInfo) {
    const id: string = clickInfo.event.id;
    this.selectedBooking.set({ ...this.bookingCalendar()?.bookings?.find(booking => booking._id === id) });
    this.isEdit.set(true);
    this.initBookingFormDialog(true);
  }

  handleEventDrop(dropInfo: any): void {
    const id: string = dropInfo.event.id;
    const event = dropInfo.event;

    this.selectedBooking.set({
      ...this.bookingCalendar()?.bookings?.find(
        booking => booking._id === id
      ),
      start: this.datesService.toLocalDateTime(event.startStr),
      end: this.datesService.toLocalDateTime(event.endStr),
    });

    this.isEdit.set(true);
    this.initBookingFormDialog(true);

    dropInfo.revert();
  }

  handleEventResize(resizeInfo: any): void {
    const id: string = resizeInfo.event.id;
    const event = resizeInfo.event;

    this.selectedBooking.set({
      ...this.bookingCalendar()?.bookings?.find(
        booking => booking._id === id
      ),
      start: this.datesService.toLocalDateTime(event.startStr),
      end: this.datesService.toLocalDateTime(event.endStr),
    });

    this.isEdit.set(true);
    this.initBookingFormDialog(true);

    resizeInfo.revert();
  }
}
