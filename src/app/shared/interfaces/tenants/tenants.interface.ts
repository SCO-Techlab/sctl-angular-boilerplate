import { IUser } from "../user";

export interface ITenant {
  _id?: string;
  name: string;
  isActive: boolean;
  owner: IUser;
  description?: string;
  members?: IUser[];
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}