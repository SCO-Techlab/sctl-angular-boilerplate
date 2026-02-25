import { ISpinnerComponent, IToastComponent } from '../shared/components';

export interface IShellComponent {
  spinnerEnabled?: boolean;
  spinnerConfig?: ISpinnerComponent;
  toastEnabled?: boolean;
  toastConfig?: IToastComponent;
}