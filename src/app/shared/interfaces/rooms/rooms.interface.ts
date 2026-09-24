import { IResidence, ITenant } from '@shared/interfaces';

export interface IRoom {
  _id?: string;
  tenant: ITenant;
  residence: IResidence;
  name: string;
  beds: number;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}