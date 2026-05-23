import { Component, DestroyRef, effect, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogComponent, InputErrorComponent } from '@core/components';
import { BUTTON_SEVERITY, INPUT_ERROR } from '@core/shared/enums';
import { IDialogComponent, IInputErrorComponent } from '@core/shared/interfaces';
import { REGEX_PATTERNS } from '@shared/constants';
import { ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { TranslateService } from '@shared/services';
import { PasswordMatchValidator } from '@shared/validators';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'sctl-edit-password-dialog',
  standalone: true,
  templateUrl: './edit-password-dialog.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PasswordModule,
    DialogComponent,
    InputErrorComponent
  ]
})
export class EditPasswordDialogComponent implements OnInit {

  public visible = input<boolean>(false);
  public dialogConfig = input<IDialogComponent>({
    closeOnSubmit: false,
    header: {
      closable: true,
      title: 'Edit Password',
      subTitle: 'Update your password'
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
        label: 'Update',
        severity: BUTTON_SEVERITY.PRIMARY,
        outlined: true,
        text: false,
        rounded: false,
        disabled: undefined
      }
    }
  });

  public submit = output<string>();
  public close = output<void>();
  public formValid = output<boolean>();

  public showDialog: boolean = false;
  public editPasswordForm: FormGroup;
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);

  constructor() {
    effect(() => {
      this.visible;
      this.showDialog = this.visible();
    })
  }

  ngOnInit(): void {
    this.showDialog = this.visible();
    this.initForm();
    this.translateService.stream('USERS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.setFormErrors(res);
      });
  }

  public onClose(): void {
    this.showDialog = false;
    this.close.emit();
  }

  public onSubmit(closeOnSubmit: boolean): void {
    if (closeOnSubmit) {
      this.showDialog = false;
    }

    const password: string = this.editPasswordForm.value.password;
    this.submit.emit(password);
  }

  private initForm(): void {
    this.editPasswordForm = new FormGroup(
      {
        password: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)])
      },
      { validators: [PasswordMatchValidator] }
    );

    this.editPasswordForm.statusChanges.subscribe((status: string) => this.formValid.emit(status === 'VALID' ? true : false));
  }

  private setFormErrors(literals: ITranslateLiterals): void {
    this.formErrors = {
      password: {
        cssClass: '',
        formControl: this.editPasswordForm.get('password'),
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: literals['ERRORS']['PASSWORD']
          },
          {
            error: INPUT_ERROR.PATTERN,
            message: literals['ERRORS']['PASSWORD_INVALID']
          }
        ]
      },
      confirmPassword: {
        cssClass: '',
        formControl: this.editPasswordForm.get('confirmPassword'),
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: literals['ERRORS']['CONFIRM_PASSWORD']
          },
          {
            error: INPUT_ERROR.PATTERN,
            message: literals['ERRORS']['CONFIRM_PASSWORD_INVALID']
          },
          {
            error: INPUT_ERROR.MISMATCH,
            message: literals['ERRORS']['PASSWORDS_NOT_MATCH']
          }
        ]
      }
    };
  }
}
