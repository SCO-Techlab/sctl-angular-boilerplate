import { ITenant } from '@shared/interfaces';

export interface ICustomerGuardian {
  name: string;
  email?: string;
  phone?: string;
  dni?: string;
  birthDate?: string;
}

export interface ICustomer {
  _id?: string;
  tenant: ITenant;
  name: string;
  email?: string;
  phone?: string;
  dni?: string;
  birthDate?: string;
  primaryGuardian?: ICustomerGuardian;
  secondaryGuardian?: ICustomerGuardian;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
