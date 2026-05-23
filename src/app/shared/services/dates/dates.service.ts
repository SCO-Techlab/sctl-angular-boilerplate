import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { DATES, REGEX_PATTERNS } from '@shared/constants';
import { DateInput } from '@shared/types';
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addYears,
  Day,
  differenceInDays,
  format,
  fromUnixTime,
  getDate,
  Interval,
  intervalToDuration,
  isAfter,
  isWithinInterval,
  lastDayOfMonth,
  parse,
  startOfMonth,
  startOfWeek,
  subMinutes,
  subYears
} from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class DatesService {

  public formatDate(formatTo?: string, date?: DateInput): string {
    return date
      ? format(new Date(date), formatTo)
      : format(new Date(), formatTo);
  }

  public addDay(amount?: number, date?: DateInput): string {
    return date ?
      addDays(new Date(date), amount).toISOString() :
      addDays(new Date(), amount).toISOString();
  }

  public parse(dateString: string, formatString: string, referenceDate?: DateInput): Date {
    return referenceDate ?
      parse(dateString, formatString, new Date(referenceDate)) :
      parse(dateString, formatString, new Date());
  }

  public addHours(amount: number, date?: DateInput): Date {
    return date ? addHours(new Date(date), amount) : addHours(new Date(), amount);
  }

  public addMinutes(amount: number, date?: DateInput): Date {
    return date ? addMinutes(new Date(date), amount) : addMinutes(new Date(), amount);
  }

  public addMonths(amount: number, date?: DateInput): Date {
    return date ? addMonths(new Date(date), amount) : addMonths(new Date(), amount);
  }

  public subYears(amount: number, date?: DateInput): Date {
    return date ? subYears(new Date(date), amount) : subYears(new Date(), amount);
  }

  public addYears(amount: number, date?: DateInput): Date {
    return date ? addYears(new Date(date), amount) : addYears(new Date(), amount);
  }

  public subMinutes(amount: number, date?: DateInput): Date {
    return date ? subMinutes(new Date(date), amount) : subMinutes(new Date(), amount);
  }

  public lastDayOfMonth(date?: DateInput): Date {
    return date ? lastDayOfMonth(new Date(date)) : lastDayOfMonth(new Date());
  }

  public startOfMonth(date?: DateInput): Date {
    return date ? startOfMonth(new Date(date)) : startOfMonth(new Date());
  }

  public weekdaysShort(): string[] {
    const firstDOW = startOfWeek(new Date(), { weekStartsOn: MAGIC_NUMBERS.N_1 as Day });
    return Array.from(Array(MAGIC_NUMBERS.N_7)).map((_e, i) =>
      this.formatDate(DATES.WEEKS, this.addDay(i, firstDOW)));
  }

  public startOfWeek(date?: DateInput, weekStartsOn: number = MAGIC_NUMBERS.N_1): Date {
    return date ?
      startOfWeek(new Date(date), { weekStartsOn: weekStartsOn as Day }) :
      startOfWeek(new Date(), { weekStartsOn: weekStartsOn as Day });
  }

  public getDate(date?: DateInput): number {
    return date ? getDate(new Date(date)) : getDate(new Date());
  }

  public fromUnixTime(date?: number): Date {
    return fromUnixTime(date);
  }
  public differenceInDays(dateA: DateInput, dateB?: DateInput): number {
    return dateB
      ? differenceInDays(new Date(dateA), new Date(dateB))
      : differenceInDays(new Date(dateA), new Date());
  }
  public isWithinInterval(interval: Interval, date?: DateInput): boolean {
    return date
      ? isWithinInterval(new Date(date), interval)
      : isWithinInterval(new Date(), interval);
  }
  public isAfter(dateA: DateInput, dateB?: DateInput): boolean {
    return dateB
      ? isAfter(new Date(dateB), new Date(dateA))
      : isAfter(new Date(), new Date(dateA));
  }

  public intervalToDuration(seconds: number): string {
    const duration = intervalToDuration({ start: MAGIC_NUMBERS.N_0, end: seconds * MAGIC_NUMBERS.N_1000 });

    return `${duration.minutes ?? MAGIC_NUMBERS.N_0}:${duration.seconds ?? MAGIC_NUMBERS.N_0}`;
  }

  public formatToHour(hour: string,): string {
    return REGEX_PATTERNS.TIME.test(hour) ? hour : this.formatDate(DATES.BASIC_TIME, hour);
  }
}