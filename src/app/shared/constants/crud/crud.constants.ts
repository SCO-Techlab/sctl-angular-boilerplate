import { BUTTON_SEVERITY } from "@shared/enums";
import { ICrudTableAction } from "@shared/interfaces";

export const CRUD_DEFAULT_TABLE_ACTIONS: ICrudTableAction[] = [
  {
    name: 'edit',
    icon: 'pi pi-pencil',
    severity: BUTTON_SEVERITY.PRIMARY
  },
  {
    name: 'delete',
    icon: 'pi pi-trash',
    severity: BUTTON_SEVERITY.DANGER
  }
];