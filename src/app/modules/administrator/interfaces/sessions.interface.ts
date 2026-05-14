import { IUser } from "@shared/interfaces";

export interface ISession {
  _id?: string;
  user: IUser;
  jti: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt: Date | undefined;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}