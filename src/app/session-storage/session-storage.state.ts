import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { SetAccessToken, SetDarkMode, SetRefreshToken, SetRememberUser, SetStaticMenu } from "./session-storage.actions";
import { ISessionStorageState } from "./session-storage.interface";

@State<ISessionStorageState>({
  name: 'sctlangularboilerplate',
  defaults: {
    rememberUser: undefined,
    darkMode: undefined,
    staticMenu: undefined,
    accessToken: undefined,
    refreshToken: undefined
  }
})
@Injectable()
export class SessionStorageState {

  @Selector()
  static rememberUser(state: ISessionStorageState): string {
    return state.rememberUser;
  }

  @Selector()
  static darkMode(state: ISessionStorageState): boolean {
    return state.darkMode;
  }

  @Selector()
  static staticMenu(state: ISessionStorageState): boolean {
    return state.staticMenu;
  }

  @Selector()
  static accessToken(state: ISessionStorageState): string {
    return state.accessToken;
  }

  @Selector()
  static refreshToken(state: ISessionStorageState): string {
    return state.refreshToken;
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

  @Action(SetStaticMenu)
  public setStaticMenu(
    { patchState }: StateContext<ISessionStorageState>,
    { payload }: SetStaticMenu
  ) {
    patchState({ staticMenu: payload.staticMenu ?? undefined });
  }

  @Action(SetAccessToken)
  public setAccessToken(
    { patchState }: StateContext<ISessionStorageState>,
    { payload }: SetAccessToken
  ) {
    patchState({ accessToken: payload.accessToken ?? undefined });
  }

  @Action(SetRefreshToken)
  public setRefreshToken(
    { patchState }: StateContext<ISessionStorageState>,
    { payload }: SetRefreshToken
  ) {
    patchState({ refreshToken: payload.refreshToken ?? undefined });
  }
}