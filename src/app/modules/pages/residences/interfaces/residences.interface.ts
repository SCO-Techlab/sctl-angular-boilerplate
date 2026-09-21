import { ITenant } from "@shared/interfaces";

export interface IResidence {
  _id?: string;
  tenant: ITenant;
  street: string;
  number: string;
  door: string;
  cadastre?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
