import { IResidence, IRoom } from "@shared/interfaces";

export interface IBookingCalendar {
  residences: IResidence[];
  rooms: IRoom[];
}