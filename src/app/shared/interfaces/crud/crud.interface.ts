import { BUTTON_SEVERITY, CRUD_COLUMN_ALIGNMENT, CRUD_COLUMN_TYPE } from "@shared/enums";

export interface ICrudComponent {
  toolbarEnabled: boolean;
  onlyTable: boolean;
  tableActions: ICrudTableAction[];
  newValueButtonEnabled: boolean;
  multipleDeleteButtonEnabled: boolean;
  exportButtonEnabled: boolean;
  searchInputEnabled: boolean;
  cols: ICrudColumn[];
  globalFilterFields: string[];
  dataKey: string;
  rowsPerPageOptions: number[];
  rowsPerPage: number;
  rowHover: boolean;
  paginator: boolean;
  showCurrentPageReport: boolean;
  exportFilename: string;
  disableSubmitButton?: Function;
  literals?: ICrudLiterals;
}

export interface ICrudColumn {
  header: string;
  field: string;
  customExportHeader?: string;
  sortable?: boolean;
  headerStyles?: string;
  headerAlign?: CRUD_COLUMN_ALIGNMENT;
  fieldStyles?: string;
  fieldAlign?: CRUD_COLUMN_ALIGNMENT;
  type?: CRUD_COLUMN_TYPE;
  exportable?: boolean; 
  options?: ICrudColumnOptions;
}

export interface ICrudColumnOptions {
  [CRUD_COLUMN_TYPE.DATE]?: {
    format?: string;
  },
  [CRUD_COLUMN_TYPE.ICON]?: {
    hideIconTooltip?: boolean;
  }
}

export interface ICrudTableAction {
  name: string;
  icon: string;
  severity: BUTTON_SEVERITY;
  value?: any;
}

export interface ICrudLiterals {
  NEW?: string;
  DELETE?: string;
  EXPORT?: string;
  PAGE_REPORT?: string;
  TITLE?: string;
  SEARCH?: string;
  BOOLEAN_TRUE?: string;
  BOOLEAN_FALSE?: string;
  JSON_EDITOR_CLOSE?: string;
  FORM_NEW?: string;
  FORM_EDIT?: string;
  FORM_CLOSE?: string;
  FORM_SAVE?: string;
  FORM_UPDATE?: string;
}