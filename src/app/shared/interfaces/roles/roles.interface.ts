import { IPermission } from "../permissions";

export interface IRole {
  _id?: string;
  name: string;
  permissions?: IPermission[] | string[];
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}