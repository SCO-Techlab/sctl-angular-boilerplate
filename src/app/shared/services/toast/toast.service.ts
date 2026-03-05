import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@shared/constants';
import { IToastMessage } from '@shared/interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {

  private _messages = new BehaviorSubject<IToastMessage[]>([]);
  private _toastLimit: number = undefined;

  public messages$ = this._messages.asObservable();

  public set toastLimit(value: number) {
    if (!value === null || value === undefined || value <= MAGIC_NUMBERS.N_0) {
      value = undefined;
    }

    this._toastLimit = value;
  }

  public add(message: IToastMessage): void {
    message.id = this.genId();
    const msgs = this._messages.getValue();

    if (this._toastLimit !== undefined && this._toastLimit > MAGIC_NUMBERS.N_0) {
      if (msgs.length >= this._toastLimit) {
        msgs.shift();
      }
    }

    this._messages.next([...msgs, message]);
    const life = message.life ?? MAGIC_NUMBERS.N_5000;
    setTimeout(() => this.remove(message.id!), life);
  }

  public clear(): void {
    this._messages.next([]);
  }

  public remove(id: string): void {
    const msgs = this._messages.getValue().filter(m => m.id !== id);
    this._messages.next(msgs);
  }

  private genId(): string {
    return Math.random()
      .toString(MAGIC_NUMBERS.N_36)
      .substring(MAGIC_NUMBERS.N_2, MAGIC_NUMBERS.N_9);
  }
}
