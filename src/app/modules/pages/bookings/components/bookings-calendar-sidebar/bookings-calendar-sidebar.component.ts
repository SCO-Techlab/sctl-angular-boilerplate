import { Component, DestroyRef, inject, input, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@core/shared';
import { PrimeNG } from 'primeng/config';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'sctl-bookings-calendar-sidebar',
  standalone: true,
  templateUrl: './bookings-calendar-sidebar.component.html',
  imports: [
    TranslateModule,
    FormsModule,
    DatePickerModule
  ]
})
export class BookingsCalendarSidebarComponent implements OnInit, OnChanges {

  public calendarDate = input<Date>();

  public onSelectDate = output<Date>();

  public currentDate: Date;

  private destroyRef = inject(DestroyRef);
  private readonly primeNG = inject(PrimeNG);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.translateService.stream('PRIMENG.LOCALE')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((translation: any) => this.primeNG.setTranslation(translation));

    this.currentDate = this.calendarDate()
      ? this.calendarDate()
      : new Date();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['calendarDate']?.currentValue) {
      this.currentDate = changes['calendarDate'].currentValue;
    }
  }

  public onSelectDateHandler(date: Date): void {
    this.onSelectDate.emit(date);
  }
}
