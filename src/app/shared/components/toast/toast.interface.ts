import { TOAST_POSITION, TOAST_SEVERITY } from './toast.enum';

export interface IToastComponent {
  position?: TOAST_POSITION;
  toastLimit?: number;
}

export interface IToastMessage {
  id?: string;
  severity: TOAST_SEVERITY;
  summary?: string;
  detail?: string;
  life?: number;
  disableIcon?: boolean;
  disableClose?: boolean;
}