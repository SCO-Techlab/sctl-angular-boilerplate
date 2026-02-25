import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { SetAutoLogin, SetDarkMode } from "./persist-storage.actions";

class PersistStorageStateModel {
  autoLogin: string;
  darkMode: boolean;
}

@State<PersistStorageStateModel>({
  name: 'persiststorage',
  defaults: {
    autoLogin: undefined,
    darkMode: undefined,
  }
})
@Injectable()
export class PersistStorageState {

  @Selector()
  static autoLogin(state: PersistStorageStateModel): string {
    return state.autoLogin;
  }

  @Selector()
  static darkMode(state: PersistStorageStateModel): boolean {
    return state.darkMode;
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
}