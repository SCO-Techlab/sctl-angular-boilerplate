import { ITenant } from "@shared/interfaces";

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
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}
