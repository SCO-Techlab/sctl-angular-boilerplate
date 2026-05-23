import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { BUTTON_SEVERITY } from '@shared/enums';
import { IDialogComponent } from '@shared/interfaces';
import { ScreenService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'sctl-dialog',
  standalone: true,
  templateUrl: './dialog.component.html',
  imports: [
    DialogModule,
    ButtonModule
  ]
})
export class DialogComponent implements OnInit {

  public visible = input<boolean>(false);
  public config = input<IDialogComponent>({
    closeOnSubmit: false,
    header: {
      closable: true,
      title: 'Dialog component',
      subTitle: 'Dialog component sub title'
    },
    footer: {
      cancelButton: {
        show: true,
        label: 'Cancel',
        severity: BUTTON_SEVERITY.SECONDARY,
        outlined: true,
        text: false,
        rounded: false,
        disabled: undefined
      },
      submitButton: {
        show: true,
        label: 'Save',
        severity: BUTTON_SEVERITY.PRIMARY,
        outlined: true,
        text: false,
        rounded: false,
        disabled: undefined
      }
    }
  });

  public submit = output<boolean>();
  public close = output<void>();

  public showDialog: boolean = false;

  public get showHeader(): boolean {
    return this.config()?.header?.title?.length > MAGIC_NUMBERS.N_0 ||
      this.config()?.header?.subTitle?.length > MAGIC_NUMBERS.N_0 ||
      this.config()?.header?.closable;
  }

  public get showFooter(): boolean {
    return this.config()?.footer?.cancelButton?.show || this.config()?.footer?.submitButton?.show;
  }

  public get cancelButtonDisabled(): boolean {
    return !this.config()?.footer?.cancelButton?.disabled
      ? false
      : this.config()?.footer?.cancelButton?.disabled?.();
  }

  public get submitButtonDisabled(): boolean {
    return !this.config()?.footer?.submitButton?.disabled
      ? false
      : this.config()?.footer?.submitButton?.disabled?.();
  }

  private screenService = inject(ScreenService);

  constructor() {
    effect(() => {
      this.visible;
      this.showDialog = this.visible();
    })
  }

  ngOnInit(): void {
    this.showDialog = this.visible();
  }

  public onClose(): void {
    this.close.emit();
  }

  public onSubmit(): void {
    this.submit.emit(this.config()?.closeOnSubmit);
  }

  public getBreakpoints(): any {
    return {
      [`${this.screenService.XL_BREAKPOINT}px`]: '60%',
      [`${this.screenService.LG_BREAKPOINT}px`]: '70%',
      [`${this.screenService.MD_BREAKPOINT}px`]: '80%',
      [`${this.screenService.SM_BREAKPOINT}px`]: '90%'
    };
  }
}
