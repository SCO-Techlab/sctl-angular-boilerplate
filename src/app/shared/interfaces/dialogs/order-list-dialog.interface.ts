import { IDialogComponent } from "@core/shared/interfaces";

export interface IOrderListDialogComponent {
  dialogConfig: IDialogComponent;
  dataKey: string;
  titleKeys: string[];
  notResponsive?: boolean;
  readonly?: boolean;
}