import { IRole } from "./roles.interface";

export interface IMenuFront {
  _id?: string;
  label?: string;
  separator?: boolean;
  icon?: string;
  link?: string;
  items?: IMenuFront[];
  roles?: IRole[];
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}