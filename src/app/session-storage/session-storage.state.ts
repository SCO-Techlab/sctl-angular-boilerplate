import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { IJwtToken } from "@shared/interfaces";
import { SetDarkMode, SetRememberUser, SetToken } from "./session-storage.actions";
import { ISessionStorageState } from "./session-storage.interface";

@State<ISessionStorageState>({
  name: 'sctlangularboilerplate',
  defaults: {
    rememberUser: undefined,
    darkMode: undefined,
    token: undefined
  }
})
@Injectable()
export class SessionStorageState {

  @Selector()
  static rememberUser(state: ISessionStorageState): { email: string, password: string } | undefined {
    return state.rememberUser;
  }

  @Selector()
  static darkMode(state: ISessionStorageState): boolean {
    return state.darkMode;
  }

  @Selector()
  static token(state: ISessionStorageState): IJwtToken {
    return state.token;
  }

  @Action(SetRememberUser)
  public setRememberUser(
    { patchState }: StateContext<ISessionStorageState>,
    { payload }: SetRememberUser
  ) {
    patchState({ rememberUser: payload.rememberUser ?? undefined });
  }

  @Action(SetDarkMode)
  public setDarkMode(
    { patchState }: StateContext<ISessionStorageState>,
    { payload }: SetDarkMode
  ) {
    patchState({ darkMode: payload.darkMode ?? undefined });
  }

  @Action(SetToken)
  public setToken(
    { patchState }: StateContext<ISessionStorageState>,
    { payload }: SetToken
  ) {
    patchState({ token: payload.token ?? undefined });
  }
}