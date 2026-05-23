import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { SCREEN_SIZE } from '@core/shared/enums/screen';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  private _size: string

  public get size(): string {
    return this._size;
  }

  public get XS(): boolean {
    return this.size === SCREEN_SIZE.XS;
  }

  public get SM(): boolean {
    return this.size === SCREEN_SIZE.SM;
  }

  public get MD(): boolean {
    return this.size === SCREEN_SIZE.MD;
  }

  public get LG(): boolean {
    return this.size === SCREEN_SIZE.LG;
  }

  public get XL(): boolean {
    return this.size === SCREEN_SIZE.XL;
  }

  public get XXL(): boolean {
    return this.size === SCREEN_SIZE.XXL;
  }

  public get isMobile(): boolean {
    return this.size === SCREEN_SIZE.XS || this.size === SCREEN_SIZE.SM;
  }

  public get isTablet(): boolean {
    return this.size === SCREEN_SIZE.MD || this.size === SCREEN_SIZE.LG;
  }

  public get isDesktop(): boolean {
    return this.size === SCREEN_SIZE.XL || this.size === SCREEN_SIZE.XXL;
  }

  public onSizeChange = new Subject<{ size: string; width: number }>();

  public readonly SM_BREAKPOINT = MAGIC_NUMBERS.N_576;
  public readonly MD_BREAKPOINT = MAGIC_NUMBERS.N_768;
  public readonly LG_BREAKPOINT = MAGIC_NUMBERS.N_992;
  public readonly XL_BREAKPOINT = MAGIC_NUMBERS.N_1200;
  public readonly XXL_BREAKPOINT = MAGIC_NUMBERS.N_1920;

  public setSize(width: number): void {
    if (width >= MAGIC_NUMBERS.N_1920) {
      this._size = SCREEN_SIZE.XXL;
    }
    else if (width >= MAGIC_NUMBERS.N_1200) {
      this._size = SCREEN_SIZE.XL;
    }
    else if (width >= MAGIC_NUMBERS.N_992) {
      this._size = SCREEN_SIZE.LG;
    }
    else if (width >= MAGIC_NUMBERS.N_768) {
      this._size = SCREEN_SIZE.MD;
    }
    else if (width >= MAGIC_NUMBERS.N_576) {
      this._size = SCREEN_SIZE.SM;
    }
    else {
      this._size = SCREEN_SIZE.XS;
    }

    this.onSizeChange.next({ size: this._size, width });
  }
}