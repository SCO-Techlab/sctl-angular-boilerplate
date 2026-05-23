import { IDialogComponent } from "@core/shared/interfaces";

export interface IFileUploadDialogComponent {
  dialogConfig: IDialogComponent;
  multiple: boolean;
  accept: string;
  chooseLabel: string;
  cancelLabel: string;
  maxFileSize: number;
}