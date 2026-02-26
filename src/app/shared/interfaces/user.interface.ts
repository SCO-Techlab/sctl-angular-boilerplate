import { IRole } from "./roles.interface";

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  userName?: string;
  personalName?: string;
  active: boolean;
  emailConfirmed?: boolean;
  role: IRole
  pwdRecoveryToken?: string;
  pwdRecoveryDate?: Date;
  extension?: any;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}