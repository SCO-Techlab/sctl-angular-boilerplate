import { Component, DestroyRef, inject, input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { BUTTON_SEVERITY, IDialogComponent, MAGIC_NUMBERS, SpinnerService, TranslateModule, TranslateService } from '@core/shared';
import { ResidenceCalendarDialogComponent } from '@shared/components';
import { formatResidenceAddress } from '@shared/helpers';
import { IResidence, IResidenceCalendar } from '@shared/interfaces';
import { ResidencesService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { PrimeNG } from 'primeng/config';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-bookings-calendar-sidebar',
  standalone: true,
  templateUrl: './bookings-calendar-sidebar.component.html',
  imports: [
    TranslateModule,
    FormsModule,
    DatePickerModule,
    SelectModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    ResidenceCalendarDialogComponent,
  ]
})
export class BookingsCalendarSidebarComponent implements OnInit, OnChanges {

  public calendarDate = input<Date>();
  public residences = input<IResidence[]>();

  public onSelectDate = output<Date>();
  public onResidenceChange = output<IResidence>();
  public onNewBooking = output<void>();

  public currentDate: Date;
  public currentResidence: IResidence;
  public residencesOptions: { name: string; value: IResidence }[] = [];

  public residenceCalendarDialogConfig: IDialogComponent;
  public showResidenceCalendarDialog: boolean;

  private readonly destroyRef = inject(DestroyRef);
  private readonly primeNG = inject(PrimeNG);
  private readonly translateService = inject(TranslateService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly residencesService = inject(ResidencesService);

  ngOnInit(): void {
    this.translateService.stream('PRIMENG.LOCALE')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((translation: any) => this.primeNG.setTranslation(translation));

    this.currentDate = this.calendarDate() ? this.calendarDate() : new Date();
    this.setResidencesOptions(this.residences());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['calendarDate']?.currentValue) {
      this.currentDate = changes['calendarDate'].currentValue;
    }

    if (changes?.['residences']?.currentValue) {
      this.setResidencesOptions(changes['residences'].currentValue);
    }
  }

  public onSelectDateHandler(date: Date): void {
    this.onSelectDate.emit(date);
  }

  public onResidenceChangeHandler(event: SelectChangeEvent): void {
    this.onResidenceChange.emit(event?.value);
    this.currentResidence = event?.value;
  }

  public onOpenResidenceCalendarDialog(): void {
    this.setResidencesCalendarDialogConfig(this.currentResidence);
    this.showResidenceCalendarDialog = true;
  }

  public onSubmitResidenceCalendar(event: IResidenceCalendar): void {
    const value = {
      ...this.currentResidence,
      calendar: {
        ...this.currentResidence?.calendar,
        ...event
      }
    };

    this.spinnerService.show();
    this.residencesService.update(this.currentResidence?._id, value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (response: IResidence) => {
          this.currentResidence.calendar = structuredClone(response.calendar);
          this.onResidenceChange.emit(this.currentResidence);
          this.showResidenceCalendarDialog = false;
        }
      });
  }

  private setResidencesOptions(residences: IResidence[]): void {
    this.residencesOptions = residences?.map(residence => ({
      name: formatResidenceAddress(residence),
      value: residence
    }));

    this.currentResidence = residences?.[MAGIC_NUMBERS.N_0] ?? null;
  }

  private setResidencesCalendarDialogConfig(value: IResidence): void {
    this.residenceCalendarDialogConfig = {
      closeOnSubmit: false,
      fullScreen: false,
      header: {
        closable: true,
        title: this.translateService.instant('PAGES.BOOKINGS.CALENDAR'),
        subTitle: formatResidenceAddress(value)
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
    };
  }
}
