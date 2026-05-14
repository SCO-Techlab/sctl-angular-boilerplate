import { JWT_TOKEN_TYPE } from "@shared/enums";
import { IUser } from "../user";

export interface IJwtToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: JWT_TOKEN_TYPE;
}

export interface IJwtPayload {
  _id: string;
  jti: string;
  isRefreshToken: boolean;
  user: IUser;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
}