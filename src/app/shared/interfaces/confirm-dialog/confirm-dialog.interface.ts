import { BUTTON_SEVERITY } from "@shared/enums";

export interface IConfirmDialog {
  header: string;
  message: string;
  icon?: string;
  rejectButton?: {
    label?: string;
    severity?: BUTTON_SEVERITY;
  };
  acceptButton?: {
    label?: string;
    severity?: BUTTON_SEVERITY;
  };
  accept?: () => void;
  reject?: () => void;
}