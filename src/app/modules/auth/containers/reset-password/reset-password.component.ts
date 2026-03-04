import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { AuthCardComponent } from '@modules/auth/components';
import { IAuthResetPasswordComponent } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { FloatingThemeConfigurator, InputErrorComponent } from '@shared/components';
import { REGEX_PATTERNS } from '@shared/constants';
import { INPUT_ERROR, TOAST_SEVERITY } from '@shared/enums';
import { ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { SpinnerService, ToastService, TranslateService } from '@shared/services';
import { passwordMatchValidator } from '@shared/validators';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  imports: [
    CommonModule,
    ButtonModule,
    PasswordModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RippleModule,
    FloatingThemeConfigurator,
    InputErrorComponent,
    TranslateModule,
    AuthCardComponent
  ],
})
export class ResetPasswordComponent implements OnInit {

  public config: IAuthResetPasswordComponent = {};
  public resetPasswordForm: FormGroup;

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
        this.setConfig();
        this.initComponent();
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
            this.toastService.add({
              severity: TOAST_SEVERITY.ERROR,
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals['RESET_PASSWORD_KO']
            });
            return;
          }

          this.toastService.add({
            severity: TOAST_SEVERITY.SUCCESS,
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals['RESET_PASSWORD_OK']
          });

          this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.toastService.add({
            severity: TOAST_SEVERITY.ERROR,
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals['FORGOT_PASSWORD_KO']
          });
        }
      })
  }

  private initComponent(): void {
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
        validators: [passwordMatchValidator]
      }
    );
  }

  private setConfig(): void {
    this.config.showConfigurator = false;

    this.config.headerConfig = {
      showLogo: true,
      logoUrl: '/assets/images/logo.png',
      logoText: '',
      logoRedirect: '',
      logoCssClass: 'w-32',
      title: this.literals['TITLE'],
      subTitle: this.literals['SUB_TITLE']
    };

    this.config.inputs = {
      password: { label: this.literals['PASSWORD_LABEL'], placeholder: this.literals['PASSWORD_PLACEHOLDER'], disabled: false },
      confirmPassword: { label: this.literals['CONFIRM_PASSWORD_LABEL'], placeholder: this.literals['CONFIRM_PASSWORD_PLACEHOLDER'], disabled: false }
    };

    this.config.links = [];

    this.config.buttonLabel = this.literals['BUTTON_LABEL'];

    this.config.formErrors = {
      password: {
        formControl: this.resetPasswordForm.get('password'),
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals['ERROR']['PASSWORD'] },
          { error: INPUT_ERROR.PATTERN, message: this.literals['ERROR']['PASSWORD_INVALID'] }
        ]
      },
      confirmPassword: {
        formControl: this.resetPasswordForm.get('confirmPassword'),
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals['ERROR']['CONFIRM_PASSWORD'] },
          { error: INPUT_ERROR.PATTERN, message: this.literals['ERROR']['CONFIRM_PASSWORD_INVALID'] },
          { error: INPUT_ERROR.MISMATCH, message: this.literals['ERROR']['PASSWORDS_NOT_MATCH'] }
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
            this.toastService.add({
              severity: TOAST_SEVERITY.ERROR,
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals['RESET_PASSWORD_USER_NOT_FOUND']
            });
            this.router.navigate(['/auth/login']);
            return;
          }

          if (!this.tokenIsExpired(result)) {
            this.toastService.add({
              severity: TOAST_SEVERITY.ERROR,
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals['RESET_PASSWORD_TOKEN_EXPIRED']
            });
            this.router.navigate(['/auth/login']);
            return;
          }

          this.userId = result._id;
        },
        error: () => {
          this.toastService.add({
            severity: TOAST_SEVERITY.ERROR,
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals['RESET_PASSWORD_USER_NOT_FOUND']
          });
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
