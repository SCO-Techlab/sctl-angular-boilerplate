import { IJwtToken } from "@shared/interfaces";

export class SetRememberUser {
  static readonly type = '[App] Set auto login';
  constructor(public payload: { rememberUser: { email: string, password: string }, delete?: boolean }) {}
}

export class SetDarkMode {
  static readonly type = '[App] Set dark mode';
  constructor(public payload: { darkMode: boolean, delete?: boolean }) {}
}

export class SetToken {
  static readonly type = '[App] Set token';
  constructor(public payload: { token: IJwtToken, delete?: boolean }) {}
}