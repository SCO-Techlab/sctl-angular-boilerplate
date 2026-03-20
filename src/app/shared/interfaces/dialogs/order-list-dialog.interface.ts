import { IDialogComponent } from "./dialog.interface";

export interface IOrderListDialogComponent {
  dialogConfig: IDialogComponent;
  dataKey: string;
  titleKeys: string[];
  notResponsive?: boolean;
  readonly?: boolean;
}