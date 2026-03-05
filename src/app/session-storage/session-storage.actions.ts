export class SetRememberUser {
  static readonly type = '[Session Storage] Set auto login';
  constructor(public payload: { rememberUser: { email: string, password: string } }) {}
}

export class SetDarkMode {
  static readonly type = '[Session Storage] Set dark mode';
  constructor(public payload: { darkMode: boolean }) {}
}

export class SetAccessToken {
  static readonly type = '[Session Storage] Set token';
  constructor(public payload: { accessToken: string }) {}
}