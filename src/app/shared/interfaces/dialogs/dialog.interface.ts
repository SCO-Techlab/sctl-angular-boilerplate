import { BUTTON_SEVERITY } from "@shared/enums";

export interface IDialogComponent {
  closeOnSubmit: boolean;
  header: {
    closable: boolean;
    title: string;
    subTitle: string;
  };
  footer: {
    cancelButton: {
      show: boolean;
      label: string;
      severity: BUTTON_SEVERITY;
      outlined: boolean;
      text: boolean;
      rounded: boolean;
      disabled?: Function;
    };
    submitButton: {
      show: boolean;
      label: string;
      severity: BUTTON_SEVERITY;
      outlined: boolean;
      text: boolean;
      rounded: boolean;
      disabled?: Function;
    };
  };
}