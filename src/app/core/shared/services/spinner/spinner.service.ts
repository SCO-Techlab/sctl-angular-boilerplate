import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@core/shared/constants';

@Injectable({
  providedIn: 'root'
})

export class SpinnerService {

  public get isShowing(): boolean {
    return this._isShowing;
  }

  private _isShowing: boolean;

  public show(): void {
    this._isShowing = true;
  }

  public hide(delay: number = MAGIC_NUMBERS.N_0): void {
    if (!delay || delay <= MAGIC_NUMBERS.N_0) {
      this._isShowing = false;
      return;
    }

    setTimeout(() => this._isShowing = false, delay);
  }
}
