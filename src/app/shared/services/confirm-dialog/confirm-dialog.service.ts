import { inject, Injectable } from '@angular/core';
import { IConfirmDialog } from '@shared/interfaces';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  private confirmationService = inject(ConfirmationService);

  confirm(confirm: IConfirmDialog): void {
    this.confirmationService.confirm({
      header: confirm.header,
      message: confirm.message,
      icon: confirm.icon,
      closable: true,
      rejectButtonProps: {
        label: confirm?.rejectButton?.label ?? 'Cancel',
        severity: confirm?.rejectButton?.severity ?? 'secondary',
        text: false
      },
      acceptButtonProps: {
        label: confirm?.acceptButton?.label ?? 'Continue',
        severity: confirm?.acceptButton?.severity ?? 'primary',
        text: false
      },
      accept: () => confirm?.accept(),
      reject: () => confirm?.reject()
    });
  }
}
