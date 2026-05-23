import { BUTTON_SEVERITY } from "@core/shared/enums";
import { ICrudTableAction } from "@shared/interfaces";

export const CRUD_ACTIONS = {
  NEW: 'new',
  DELETE_MULTIPLE: 'deleteMultiple',
  EXPORT: 'export',
  GLOBAL_FILTER: 'globalFilter',
  EDIT: 'edit',
  DELETE: 'delete',
  CLEAR_FILTERS: 'clearFilters',
  SEARCH_FILTERS: 'searchFilters',
}

export const CRUD_EDIT_TABLE_ACTION: ICrudTableAction = {
  name: CRUD_ACTIONS.EDIT,
  icon: 'pi pi-pencil',
  severity: BUTTON_SEVERITY.PRIMARY,
  disabled: () => { return false; }
};

export const CRUD_DELETE_TABLE_ACTION: ICrudTableAction = {
  name: CRUD_ACTIONS.DELETE,
  icon: 'pi pi-trash',
  severity: BUTTON_SEVERITY.DANGER,
  disabled: () => { return false; }
};

export const CRUD_DEFAULT_TABLE_ACTION: ICrudTableAction = {
  name: 'default',
  icon: 'pi pi-eye',
  severity: BUTTON_SEVERITY.INFO,
  disabled: () => { return false; }
};