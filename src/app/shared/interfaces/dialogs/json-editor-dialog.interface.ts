import { IDialogComponent, IJsonEditorComponent } from "@core/shared/interfaces";

export interface IJsonEditorDialogComponent {
  dialogConfig: IDialogComponent;
  jsonConfig: IJsonEditorComponent;
}