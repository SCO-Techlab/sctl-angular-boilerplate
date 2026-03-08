import { IPermission } from "./permissions.interface";

export interface IRole {
  _id?: string;
  name: string;
  permissions?: IPermission[];
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}