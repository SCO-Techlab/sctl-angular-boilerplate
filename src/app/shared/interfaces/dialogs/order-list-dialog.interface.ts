import { IDialogComponent } from "./dialog.interface";

export interface IOrderListDialogComponent {
  dialogConfig: IDialogComponent;
  dataKey: string;
  notResponsive?: boolean;
  readonly?: boolean;
}