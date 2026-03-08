import { BUTTON_SEVERITY } from "@shared/enums";

export interface IFileUploadDialogComponent {
  dialogConfig: {
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
        disabled?: () => boolean;
      };
      submitButton: {
        show: boolean;
        label: string;
        severity: BUTTON_SEVERITY;
        outlined: boolean;
        text: boolean;
        rounded: boolean;
        disabled?: () => boolean;
      };
    };
  },
  multiple: boolean;
  accept: string;
  chooseLabel: string;
  cancelLabel: string;
  maxFileSize: number;
}