import { IPermission } from "./permissions.interface";

export interface IRole {
  _id?: string;
  name: string;
  permissions?: IPermission[];
  extension?: any;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}