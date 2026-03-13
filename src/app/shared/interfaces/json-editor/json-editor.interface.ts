import { JSON_EDITOR_HEIGHT_UNIT, JSON_EDITOR_MODE, JSON_EDITOR_TYPE } from "@shared/enums";

export interface IJsonEditorComponent {
  mode: JSON_EDITOR_MODE;
  height: number;
  heightUnit: JSON_EDITOR_HEIGHT_UNIT;
  type: JSON_EDITOR_TYPE;
  inputId?: string;
}