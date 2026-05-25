import { IDialogComponent } from "../dialog";
import { IJsonEditorComponent } from "../json-editor/json-editor.interface";

export interface IJsonEditorDialogComponent {
  dialogConfig: IDialogComponent;
  jsonConfig: IJsonEditorComponent;
}