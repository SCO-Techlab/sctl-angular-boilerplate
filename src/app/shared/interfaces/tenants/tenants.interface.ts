import { IUser } from "../user";

export interface ITenant {
  _id?: string;
  name: string;
  isActive: boolean;
  owner: IUser;
  description?: string;
  members?: IUser[];
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}