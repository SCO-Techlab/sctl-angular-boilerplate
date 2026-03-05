import { IJwtToken } from "@shared/interfaces";

export class SetRememberUser {
  static readonly type = '[Session Storage] Set auto login';
  constructor(public payload: { rememberUser: { email: string, password: string } }) {}
}

export class SetDarkMode {
  static readonly type = '[Session Storage] Set dark mode';
  constructor(public payload: { darkMode: boolean }) {}
}

export class SetToken {
  static readonly type = '[Session Storage] Set token';
  constructor(public payload: { token: IJwtToken }) {}
}