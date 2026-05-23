import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { InputErrorComponent } from '@core/components';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent } from '@core/shared/interfaces';
import { SpinnerService } from '@core/shared/services';
import { AuthCardComponent } from '@modules/auth/components';
import { setAuthCardConfig } from '@modules/auth/helpers';
import { IAuthCardComponent, IAuthInput } from '@modules/auth/interfaces';
import { REGEX_PATTERNS } from '@shared/constants';
import { ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { AuthService, ToastService, TranslateService } from '@shared/services';
import { PasswordMatchValidator } from '@shared/validators';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    PasswordModule,
    AuthCardComponent,
    InputErrorComponent
  ],
})
export class ResetPasswordComponent implements OnInit {

  public cardConfig: IAuthCardComponent = {};
  public resetPasswordForm: FormGroup;
  public inputs: { [key: string]: IAuthInput } = {};
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;
  private userId: string;

  private destroyRef$ = inject(DestroyRef);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.initForm();

    this.translateService.stream('AUTH.RESET_PASSWORD')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.cardConfig = setAuthCardConfig(this.literals['TITLE'], this.literals['SUB_TITLE']);
        this.subscribeToQueryParams();
        this.setInputs();
        this.setFormErrors();
      });
  }

  onClickLink(url: string): void {
    if (url) {
      this.router.navigate([url]);
    }
  }

  onClickButton(): void {
    const password: string = this.resetPasswordForm.get('password')?.value;

    this.spinnerService.show();
    this.authService.passwordRecoveryReset(this.userId, password)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (result: boolean) => {
          if (!result) {
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['RESET_PASSWORD_KO'] });
            return;
          }

          this.toastService.success({ summary: this.translateService.instant('TOAST.SUCCESS'), detail: this.literals['RESET_PASSWORD_OK'] });
          this.router.navigate(['/auth/login']);
        },
        error: () => this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['FORGOT_PASSWORD_KO'] })
      })
  }

  private subscribeToQueryParams(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((params: Params) => {
        this.findUser(params['pwdRecoveryToken']);
      });
  }

  private initForm(): void {
    this.resetPasswordForm = new FormGroup(
      {
        password: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)])
      },
      {
        validators: [PasswordMatchValidator]
      }
    );
  }

  private setInputs(): void {
    this.inputs = {
      password: {
        label: this.literals['PASSWORD_LABEL'],
        placeholder: this.literals['PASSWORD_PLACEHOLDER'],
        disabled: false
      },
      confirmPassword: {
        label: this.literals['CONFIRM_PASSWORD_LABEL'],
        placeholder: this.literals['CONFIRM_PASSWORD_PLACEHOLDER'],
        disabled: false
      }
    };
  }

  private setFormErrors(): void {
    this.formErrors = {
      password: {
        formControl: this.resetPasswordForm.get('password'),
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
      confirmPassword: {
        formControl: this.resetPasswordForm.get('confirmPassword'),
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

  private findUser(pwdRecoveryToken: string): void {
    this.spinnerService.show();
    this.authService.passwordRecoveryFind(pwdRecoveryToken)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (result: IUser) => {
          if (!result) {
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['RESET_PASSWORD_USER_NOT_FOUND'] });
            this.router.navigate(['/auth/login']);
            return;
          }

          if (!this.tokenIsExpired(result)) {
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['RESET_PASSWORD_TOKEN_EXPIRED'] });
            this.router.navigate(['/auth/login']);
            return;
          }

          this.userId = result._id;
        },
        error: () => {
          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['RESET_PASSWORD_USER_NOT_FOUND'] });
          this.router.navigate(['/auth/login']);
        }
      })
  }

  private tokenIsExpired(user: IUser): boolean {
    const tokenDate: Date = user?.pwdRecoveryDate
      ? new Date(user.pwdRecoveryDate)
      : undefined;

    return tokenDate?.getTime() < new Date().getTime();
  }
}
