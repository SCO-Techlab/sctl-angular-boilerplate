import { BUTTON_SEVERITY } from "@shared/enums";
import { ICrudTableAction } from "@shared/interfaces";

export const CRUD_ACTIONS = {
  NEW: 'new',
  DELETE_MULTIPLE: 'deleteMultiple',
  EXPORT: 'export',
  GLOBAL_FILTER: 'globalFilter',
  EDIT: 'edit',
  DELETE: 'delete',
}

export const CRUD_DEFAULT_TABLE_ACTIONS: ICrudTableAction[] = [
  {
    name: CRUD_ACTIONS.EDIT,
    icon: 'pi pi-pencil',
    severity: BUTTON_SEVERITY.PRIMARY
  },
  {
    name: CRUD_ACTIONS.DELETE,
    icon: 'pi pi-trash',
    severity: BUTTON_SEVERITY.DANGER
  }
];