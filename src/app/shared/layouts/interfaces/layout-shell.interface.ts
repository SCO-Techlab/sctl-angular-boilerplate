import { ISpinnerComponent, IToastComponent } from '../../components';

export interface ILayoutShell {
  spinnerEnabled?: boolean;
  spinnerConfig?: ISpinnerComponent;
  toastEnabled?: boolean;
  toastConfig?: IToastComponent;
}