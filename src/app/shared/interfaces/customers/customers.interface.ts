import { ITenant } from '@shared/interfaces';

export interface ICustomer {
  _id?: string;
  tenant: ITenant;
  name: string;
  email?: string;
  phone?: string;
  dni?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
