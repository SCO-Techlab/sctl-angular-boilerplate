import { BUTTON_SEVERITY } from '../../enums';
import { CRUD_COLUMN_TYPE, CRUD_INPUT_TYPE } from './crud.enum';

export interface ICrudColumn {
  field: string;
  header: string;
  type: CRUD_COLUMN_TYPE;
  sortable?: boolean;
  options?: ICrudColumnOptions;
}

export interface ICrudColumnOptions {
  [CRUD_COLUMN_TYPE.DATE]?: {
    format: string;
  };
  [CRUD_COLUMN_TYPE.AVATAR]?: {
    avatarUrl: string;
  }
}

export interface ICrudButtonsEnabled {
  EXPORT: boolean;
  NEW: boolean;
  DELETE: boolean;
  SEARCH: boolean;
  EDIT_ACTION: boolean;
  DELETE_ACTION: boolean;
}

export interface ICrudSaveEvent {
  value: any;
  isEdit: boolean;
}

export interface ICrudFormInput {
  field: string;
  label: string;
  type: CRUD_INPUT_TYPE;
  options?: ICrudFormInputOptions;
  required?: boolean;
  default?: any;
  hideOnCreate?: boolean;
  hideOnEdit?: boolean;
}

export interface ICrudFormInputOptions {
  [CRUD_INPUT_TYPE.ENUM]?: {
    values: ICrudFormInputValues[];
  };
  [CRUD_INPUT_TYPE.SELECT]?: {
    values: ICrudFormInputValues[];
  };
  [CRUD_INPUT_TYPE.NUMBER]?: {
    min?: number;
    max?: number;
  };
}

export interface ICrudFormInputValues {
  label: string;
  value: any;
}

export interface ICrudAction {
  name: string;
  icon: string;
  severity?: BUTTON_SEVERITY;
}

export interface ICrudActionEvent {
  action: ICrudAction;
  value: any;
}

export interface ICrudLiterals {
  TITLE: string;
  FORM_TITLE: string;
  FORM_TITLE_EDIT: string;
  DELETE_TITLE: string;
  DELETE_MESSAGE: string;
  DELETE_MULTIPLE_TITLE: string;
  DELETE_MULTIPLE_MESSAGE: string;
  SAVE: string;
  EDIT: string;
  CANCEL: string;
  DELETE: string;
  SEARCH: string;
  NEW: string;
  EXPORT: string;
  YES: string;
  NO: string;
  PAGINATOR_REPORT: string;
}

export interface ICrudInputError {
  [input: string]: string;
}