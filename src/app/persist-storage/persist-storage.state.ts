import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { IJwtToken } from "@shared/interfaces";
import { SetAutoLogin, SetDarkMode, SetToken } from "./persist-storage.actions";

class PersistStorageStateModel {
  autoLogin: { email: string, password: string } | undefined;
  darkMode: boolean;
  token: IJwtToken
}

@State<PersistStorageStateModel>({
  name: 'persiststorage',
  defaults: {
    autoLogin: undefined,
    darkMode: undefined,
    token: undefined
  }
})
@Injectable()
export class PersistStorageState {

  @Selector()
  static autoLogin(state: PersistStorageStateModel): { email: string, password: string } | undefined {
    return state.autoLogin;
  }

  @Selector()
  static darkMode(state: PersistStorageStateModel): boolean {
    return state.darkMode;
  }

  @Selector()
  static token(state: PersistStorageStateModel): IJwtToken {
    return state.token;
  }

  @Action(SetAutoLogin)
  public setAutoLogin(
    { patchState }: StateContext<PersistStorageStateModel>,
    { payload }: SetAutoLogin
  ) {
    patchState({
      autoLogin: payload.delete
        ? undefined
        : payload.autoLogin
    });
  }

  @Action(SetDarkMode)
  public setDarkMode(
    { patchState }: StateContext<PersistStorageStateModel>,
    { payload }: SetDarkMode
  ) {
    patchState({
      darkMode: payload.delete
        ? undefined
        : payload.darkMode
    });
  }

  @Action(SetToken)
  public setToken(
    { patchState }: StateContext<PersistStorageStateModel>,
    { payload }: SetToken
  ) {
    patchState({
      token: payload.delete
        ? undefined
        : payload.token
    });
  }
}