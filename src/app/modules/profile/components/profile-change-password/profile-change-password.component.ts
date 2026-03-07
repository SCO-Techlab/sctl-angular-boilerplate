import { Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '@modules/profile/services';
import { InputErrorComponent } from '@shared/components';
import { REGEX_PATTERNS } from '@shared/constants';
import { INPUT_ERROR } from '@shared/enums';
import { IInputErrorComponent, ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { SpinnerService, ToastService, TranslateService } from '@shared/services';
import { PasswordMatchValidator } from '@shared/validators';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-profile-change-password',
  standalone: true,
  templateUrl: './profile-change-password.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PasswordModule,
    ButtonModule,
    InputErrorComponent
  ]
})
export class ProfileChangePasswordComponent {
  public user = input<IUser>();

  public changePasswordForm: FormGroup;
  public lockForm: boolean = true;
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private profileService = inject(ProfileService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initForm();

    this.translateService.stream('PROFILE.CHANGE_PASSWORD')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  public onClickLockOrUnlockForm(): void {
    this.lockForm = !this.lockForm;
    this.profileService.disableOrEnableForm(this.changePasswordForm, this.lockForm);

    if (this.lockForm) {
      this.changePasswordForm.setValue({
        currentPassword: '',
        password: '',
        confirmPassword: ''
      });
    }
  }

  public onClickSave(): void {
    const _id: string = this.user()?._id;
    const currentPassword: string = this.changePasswordForm.value.currentPassword;
    const password: string = this.changePasswordForm.value.password;

    this.spinnerService.show();
    this.profileService.updateUserPassword(_id, currentPassword, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (result: boolean) => {
          if (!result) {
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['REQUEST_KO'] });
            return;
          }

          this.onClickLockOrUnlockForm();
          this.toastService.success({ summary: this.translateService.instant('TOAST.SUCCESS'), detail: this.literals['REQUEST_OK'] });
        },
        error: () => {
          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['REQUEST_KO'] });
        }
      });
  }

  private initForm(): void {
    this.changePasswordForm = new FormGroup(
      {
        currentPassword: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]),
        password: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)])
      },
      { validators: [PasswordMatchValidator] }
    );

    this.profileService.disableOrEnableForm(this.changePasswordForm, this.lockForm);
  }

  private setFormErrors(): void {
    this.formErrors = {
      currentPassword: {
        cssClass: '',
        formControl: this.changePasswordForm.get('currentPassword'),
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['PASSWORD']
          },
          {
            error: INPUT_ERROR.PATTERN,
            message: this.literals['ERROR']['PASSWORD_INVALID']
          }
        ]
      },
      password: {
        cssClass: '',
        formControl: this.changePasswordForm.get('password'),
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['NEW_PASSWORD']
          },
          {
            error: INPUT_ERROR.PATTERN,
            message: this.literals['ERROR']['NEW_PASSWORD_INVALID']
          }
        ]
      },
      confirmPassword: {
        cssClass: '',
        formControl: this.changePasswordForm.get('confirmPassword'),
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['CONFIRM_PASSWORD']
          },
          {
            error: INPUT_ERROR.PATTERN,
            message: this.literals['ERROR']['CONFIRM_PASSWORD_INVALID']
          },
          {
            error: INPUT_ERROR.MISMATCH,
            message: this.literals['ERROR']['PASSWORDS_NOT_MATCH']
          }
        ]
      }
    };
  }
}
