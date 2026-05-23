export class SetDarkMode {
  static readonly type = '[Session Storage] Set dark mode';
  constructor(public payload: { darkMode: boolean }) {}
}

export class SetStaticMenu {
  static readonly type = '[Session Storage] Set static menu';
  constructor(public payload: { staticMenu: boolean }) {}
}

export class SetAccessToken {
  static readonly type = '[Session Storage] Set token';
  constructor(public payload: { accessToken: string }) {}
}

export class SetRefreshToken {
  static readonly type = '[Session Storage] Set refresh token';
  constructor(public payload: { refreshToken: string }) {}
}