import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { TOAST_SEVERITY } from '@core/shared/enums';
import { IToastMessage } from '@core/shared/interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {

  private _messages: BehaviorSubject<IToastMessage[]> = new BehaviorSubject<IToastMessage[]>([]);
  private _toastLimit: number = undefined;

  public readonly messages$ = this._messages.asObservable();

  public set toastLimit(value: number | undefined) {
    this._toastLimit = !value || value <= MAGIC_NUMBERS.N_0
      ? undefined
      : value;
  }

  public success(message: IToastMessage): void {
    message.severity = message.severity ?? TOAST_SEVERITY.SUCCESS;
    this.add(message);
  }

  public error(message: IToastMessage): void {
    message.severity = message.severity ?? TOAST_SEVERITY.ERROR;
    this.add(message);
  }

  public info(message: IToastMessage): void {
    message.severity = message.severity ?? TOAST_SEVERITY.INFO;
    this.add(message);
  }

  public warn(message: IToastMessage): void {
    message.severity = message.severity ?? TOAST_SEVERITY.WARNING;
    this.add(message);
  }

  public add(message: IToastMessage): void {
    message.id = this.genId();
    const msgs = this._messages.getValue();

    if (this._toastLimit > MAGIC_NUMBERS.N_0) {
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
