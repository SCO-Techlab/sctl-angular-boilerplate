import { JWT_TOKEN_TYPE } from "@shared/enums";
import { IUser } from "../user.interface";

export interface IJwtToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: JWT_TOKEN_TYPE;
}

export interface IJwtPayload {
  _id: string;
  user: IUser;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
}