import { RESIDENCES_CALENDAR_TYPE } from "@shared/enums";
import { ITenant } from "@shared/interfaces";

export interface IResidenceCalendar {
  calendarType?: RESIDENCES_CALENDAR_TYPE;
  weekNumber?: boolean;
  showWeekends?: boolean;
  overlappingBookings?: boolean;
  reminderEmailDaysBefore?: number;
  newBookingEmailEnabled?: boolean;
  bookingUpdatedEmailEnabled?: boolean;
  bookingCompletionReminderEmailEnabled?: boolean;
  bookingCompletedEmailEnabled?: boolean;
  bookingCancelledEmailEnabled?: boolean;
}

export interface IResidence {
  _id?: string;
  tenant: ITenant;
  street: string;
  number: string;
  flat?: string;
  door?: string;
  city: string;
  province: string;
  postalCode: string;
  cadastre?: string;
  description?: string;
  images?: string[];
  calendar?: IResidenceCalendar;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
