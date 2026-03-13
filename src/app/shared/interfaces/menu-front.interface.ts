import { IRole } from "./roles.interface";

export interface IMenuFront {
  _id?: string;
  label?: string;
  separator?: boolean;
  icon?: string;
  routerLink?: string;
  items?: IMenuFront[];
  roles?: IRole[] | string[];
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}