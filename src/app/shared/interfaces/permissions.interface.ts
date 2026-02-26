import { PERMISSION_TYPE } from "@shared/enums";

export interface IPermission {
  _id?: string;
  name: string;
  type: PERMISSION_TYPE;
  extension?: any;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}