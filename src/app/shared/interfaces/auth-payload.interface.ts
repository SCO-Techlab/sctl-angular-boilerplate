import { IUser } from "./user.interface";

export interface IAuthPayload {
  _id: string;
  user: IUser;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
}