import { IDialogComponent } from "../dialog";

export interface IOrderListDialogComponent {
  dialogConfig: IDialogComponent;
  dataKey: string;
  titleKeys: string[];
  notResponsive?: boolean;
  readonly?: boolean;
}