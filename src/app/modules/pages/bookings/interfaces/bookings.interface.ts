import { ICustomer, IResidence, IRoom, ITenant } from "@shared/interfaces";

export interface IBooking {
  _id?: string;
  tenant: ITenant;
  rooms: IRoom[];
  totalCustomers: number;
  customer: ICustomer;
  start: string;
  end: string;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface IBookingCalendar {
  residences: IResidence[];
  rooms: IRoom[];
  customers: ICustomer[];
  bookings: IBooking[];
}