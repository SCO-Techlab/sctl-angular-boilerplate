import { IUser } from "@shared/interfaces";

export interface ISession {
  _id?: string;
  user: IUser;
  accessJti: string;
  accessExpiresAt: Date;
  refreshJti?: string;
  refreshExpiresAt?: Date;
  isRevoked: boolean;
  isAccessRevoked?: boolean;
  isRefreshRevoked?: boolean;
  revokedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}