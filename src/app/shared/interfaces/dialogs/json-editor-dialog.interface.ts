import { IJsonEditorComponent } from "../json-editor";
import { IDialogComponent } from "./dialog.interface";

export interface IJsonEditorDialogComponent {
  dialogConfig: IDialogComponent;
  jsonConfig: IJsonEditorComponent;
}