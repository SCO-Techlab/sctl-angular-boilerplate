import { ISpinnerComponent, IToastComponent } from "@shared/interfaces";

export interface IShellComponent {
  spinnerEnabled?: boolean;
  spinnerConfig?: ISpinnerComponent;
  toastEnabled?: boolean;
  toastConfig?: IToastComponent;
}