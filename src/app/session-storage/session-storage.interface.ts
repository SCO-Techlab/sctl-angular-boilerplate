export interface ISessionStorageState {
  rememberUser: { email: string, password: string } | undefined;
  darkMode: boolean;
  accessToken: string
}