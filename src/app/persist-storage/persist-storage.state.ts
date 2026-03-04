import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { IJwtToken } from "@shared/interfaces";
import { SetDarkMode, SetRememberUser, SetToken } from "./persist-storage.actions";

class PersistStorageStateModel {
  rememberUser: { email: string, password: string } | undefined;
  darkMode: boolean;
  token: IJwtToken
}

@State<PersistStorageStateModel>({
  name: 'persiststorage',
  defaults: {
    rememberUser: undefined,
    darkMode: undefined,
    token: undefined
  }
})
@Injectable()
export class PersistStorageState {

  @Selector()
  static rememberUser(state: PersistStorageStateModel): { email: string, password: string } | undefined {
    return state.rememberUser;
  }

  @Selector()
  static darkMode(state: PersistStorageStateModel): boolean {
    return state.darkMode;
  }

  @Selector()
  static token(state: PersistStorageStateModel): IJwtToken {
    return state.token;
  }

  @Action(SetRememberUser)
  public setRememberUser(
    { patchState }: StateContext<PersistStorageStateModel>,
    { payload }: SetRememberUser
  ) {
    patchState({
      rememberUser: payload.delete
        ? undefined
        : payload.rememberUser
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