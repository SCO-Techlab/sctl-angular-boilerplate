import { JWT_TOKEN_TYPE } from "@shared/enums";

export interface IJwtToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: JWT_TOKEN_TYPE;
}