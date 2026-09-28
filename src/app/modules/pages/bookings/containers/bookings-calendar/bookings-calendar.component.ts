import { CommonModule } from '@angular/common';
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
  public selectedResidenceBookings = computed(() => this.bookingCalendar()?.bookings?.filter(booking => booking.room?.residence?._id === this.selectedResidence()?._id) ?? []);
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
        this.listenTonSelecTenantChanges();
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
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['NEW_BOOKING_KO']
          });
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
        error: () => {
          this.toastService.error({
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals?.['EDIT_BOOKING_KO']
          });
        }
      });
  }

  public deleteBookingHandler(value: IBooking): void {
    this.confirmDialogService.confirm({
      header: this.literals?.['DELETE']?.['HEADER'],
      message: `${this.literals?.['DELETE']?.['MESSAGE']}<br><br><center>${value.customer.name} - ${value.room.name}</center>`,
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
          if (!this.selectedResidence()?._id) {
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
      height: '100%',
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, multiMonthPlugin, themePlugin],
      headerToolbar: { left: '', center: 'title', right: '' },
      initialDate: this.calendarDate(),
      initialView: this.selectedResidence()?.calendar?.calendarType,
      initialEvents: this.selectedResidenceBookings()?.map(booking => ({
        id: booking._id,
        title: `${booking.room.name} - ${booking.customer.name}`,
        start: booking.start,
        end: booking.end,
        allDay: false
      })),
      weekends: true,
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      firstDay: MAGIC_NUMBERS.N_1,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventDrop: this.handleEventDrop.bind(this),
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
        subTitle: edit ? `${this.selectedBooking()?.customer.name} - ${this.selectedBooking()?.room.name}` : '',
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

  // FC
  handleDateSelect(selectInfo: DateSelectInfo) {
    const monthMode = this.calendarOptions()?.initialView === RESIDENCES_CALENDAR_TYPE.DAY_GRID_MONTH;

    if (monthMode) {
      console.log(selectInfo.end);
      console.log(selectInfo.endStr);
    }

    this.selectedBooking.set({
      _id: null,
      tenant: null,
      room: null,
      customer: null,
      start: this.datesService.toLocalDateTime(selectInfo.startStr),
      end: this.datesService.toLocalDateTime(selectInfo.endStr),
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
}
