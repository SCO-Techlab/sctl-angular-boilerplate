import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '../../constants';
import { SCREEN_SIZE } from './screen.enum';

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

  public get LG(): boolean {
    return this.size === SCREEN_SIZE.LG;
  }

  public get XL(): boolean {
    return this.size === SCREEN_SIZE.XL;
  }

  public get XXL(): boolean {
    return this.size === SCREEN_SIZE.XXL;
  }

  setSize(width: number): void {
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
      this._size = SCREEN_SIZE.SM;
    }
    else {
      this._size = SCREEN_SIZE.XS;
    }
  }

}
