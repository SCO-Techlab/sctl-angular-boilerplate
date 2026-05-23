import { IJsonEditorComponent } from "@core/shared/interfaces";
import { IDialogComponent } from "./dialog.interface";

export interface IJsonEditorDialogComponent {
  dialogConfig: IDialogComponent;
  jsonConfig: IJsonEditorComponent;
}