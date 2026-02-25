import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@shared/constants';
import { IToastMessage } from '@shared/interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {

  private _messages = new BehaviorSubject<IToastMessage[]>([]);
  messages$ = this._messages.asObservable();

  private _toastLimit: number = undefined;

  public set toastLimit(value: number) {
    if (!value === null || value === undefined || value <= MAGIC_NUMBERS.N_0) {
      value = undefined;
    }
    
    this._toastLimit = value;
  }

  add(message: IToastMessage) {
    message.id = this.genId();
    const msgs = this._messages.getValue();

    if (this._toastLimit !== undefined && this._toastLimit > MAGIC_NUMBERS.N_0) {
      if (msgs.length >= this._toastLimit) {
        msgs.shift();
      }
    }

    this._messages.next([...msgs, message]);
    const life = message.life ?? MAGIC_NUMBERS.N_3000;
    setTimeout(() => this.remove(message.id!), life);
  }

  clear() {
    this._messages.next([]);
  }

  remove(id: string) {
    const msgs = this._messages.getValue().filter(m => m.id !== id);
    this._messages.next(msgs);
  }

  private genId() {
    return Math.random()
      .toString(MAGIC_NUMBERS.N_36)
      .substring(MAGIC_NUMBERS.N_2, MAGIC_NUMBERS.N_9);
  }
}
