import { IDialogComponent } from "./dialog.interface";

export interface IFileUploadDialogComponent {
  dialogConfig: IDialogComponent;
  multiple: boolean;
  accept: string;
  chooseLabel: string;
  cancelLabel: string;
  maxFileSize: number;
}