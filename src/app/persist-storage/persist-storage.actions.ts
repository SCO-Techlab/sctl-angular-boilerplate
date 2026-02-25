export class SetAutoLogin {
  static readonly type = '[App] Set auto login';
  constructor(public payload: { autoLogin: string, delete?: boolean }) {}
}

export class SetDarkMode {
  static readonly type = '[App] Set dark mode';
  constructor(public payload: { darkMode: boolean, delete?: boolean }) {}
}