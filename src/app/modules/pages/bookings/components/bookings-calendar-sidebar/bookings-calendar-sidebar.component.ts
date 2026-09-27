import { Component, DestroyRef, inject, input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MAGIC_NUMBERS, TranslateModule, TranslateService } from '@core/shared';
import { formatResidenceAddress } from '@shared/helpers';
import { IResidence } from '@shared/interfaces';
import { PrimeNG } from 'primeng/config';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectChangeEvent, SelectModule } from 'primeng/select';

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
    InputGroupAddonModule
  ]
})
export class BookingsCalendarSidebarComponent implements OnInit, OnChanges {

  public calendarDate = input<Date>();
  public residences = input<IResidence[]>();

  public onSelectDate = output<Date>();
  public onResidenceChange = output<IResidence>();

  public currentDate: Date;
  public currentResidence: IResidence;
  public residencesOptions: { name: string; value: IResidence }[] = [];

  private destroyRef = inject(DestroyRef);
  private readonly primeNG = inject(PrimeNG);
  private readonly translateService = inject(TranslateService);

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
  }

  private setResidencesOptions(residences: IResidence[]): void {
    this.residencesOptions = residences?.map(residence => ({
      name: formatResidenceAddress(residence),
      value: residence
    }));

    this.currentResidence = residences?.[MAGIC_NUMBERS.N_0] ?? null;
  }
}
