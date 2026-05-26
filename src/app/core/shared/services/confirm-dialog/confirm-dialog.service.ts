import { inject, Injectable } from '@angular/core';
import { CONFIRM_DIALOG_ICONS } from '@core/shared/constants';
import { IConfirmDialog } from '@core/shared/interfaces';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  private readonly confirmationService = inject(ConfirmationService);

  public confirm(confirm: IConfirmDialog): void {
    this.confirmationService.confirm({
      header: confirm.header,
      message: confirm.message,
      icon: confirm.icon ?? CONFIRM_DIALOG_ICONS.WARNING,
      closable: true,
      rejectButtonProps: {
        label: confirm?.rejectButton?.label ?? 'Cancel',
        severity: confirm?.rejectButton?.severity ?? 'secondary',
        text: false
      },
      acceptButtonProps: {
        label: confirm?.acceptButton?.label ?? 'Continue',
        severity: confirm?.acceptButton?.severity ?? 'danger',
        text: false
      },
      accept: () => confirm?.accept?.(),
      reject: () => confirm?.reject?.()
    });
  }
}
