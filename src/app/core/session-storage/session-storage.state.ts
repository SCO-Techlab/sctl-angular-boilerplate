import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { SetAccessToken, SetDarkMode, SetRefreshToken, SetStaticMenu } from "./session-storage.actions";
import { ISessionStorageState } from "./session-storage.interface";

@State<ISessionStorageState>({
  name: 'sctlangularboilerplate',
  defaults: {
    darkMode: undefined,
    staticMenu: undefined,
    accessToken: undefined,
    refreshToken: undefined
  }
})
@Injectable()
export class SessionStorageState {

  @Selector()
  public static darkMode(state: ISessionStorageState): boolean {
    return state.darkMode;
  }

  @Selector()
  public static staticMenu(state: ISessionStorageState): boolean {
    return state.staticMenu;
  }

  @Selector()
  public static accessToken(state: ISessionStorageState): string {
    return state.accessToken;
  }

  @Selector()
  public static refreshToken(state: ISessionStorageState): string {
    return state.refreshToken;
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