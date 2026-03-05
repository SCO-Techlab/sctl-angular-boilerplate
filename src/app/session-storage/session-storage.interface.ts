import { IJwtToken } from "@shared/interfaces";

export interface ISessionStorageState {
  rememberUser: { email: string, password: string } | undefined;
  darkMode: boolean;
  token: IJwtToken
}