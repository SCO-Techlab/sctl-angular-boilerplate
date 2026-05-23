import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@core/shared/constants';

@Injectable({
  providedIn: 'root'
})

export class SpinnerService {

  private _isShowing: boolean;

  public get isShowing(): boolean {
    return this._isShowing;
  }

  public show(): void {
    this._isShowing = true;
  }

  public hide(delay: number = MAGIC_NUMBERS.N_0): void {
    if (delay === undefined || delay === null || delay <= MAGIC_NUMBERS.N_0) {
      this._isShowing = false;
      return;
    }
    setTimeout(() => this._isShowing = false, delay);
  }
}
