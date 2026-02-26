import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthCardComponent } from '@modules/auth/components';
import { IForgotPasswordComponent } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { FloatingThemeConfigurator, InputErrorComponent } from '@shared/components';
import { REGEX_PATTERNS } from '@shared/constants';
import { INPUT_ERROR, TOAST_SEVERITY } from '@shared/enums';
import { ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { SpinnerService, ToastService, TranslateService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
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
export class ForgotPasswordComponent implements OnInit {

  public config: IForgotPasswordComponent = {};
  public forgotPasswordForm: FormGroup;

  private literals: ITranslateLiterals;

  private destroyRef$ = inject(DestroyRef);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initForm();
    this.checkDefaultConfig();

    this.translateService.stream('AUTH.FORGOT_PASSWORD')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCustomConfig();
        this.setConfigFormErrors();
      });
  }

  onClickLink(): void {
    if (this.config?.linkUrl) {
      this.router.navigate([this.config.linkUrl]);
    }
  }

  onClickButton(): void {
    const email: string = this.forgotPasswordForm.get('email')?.value;

    this.spinnerService.show();
    this.authService.forgotPassword(email)
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
              detail: this.literals['REQUEST_KO']
            });
            return;
          }

          this.toastService.add({
            severity: TOAST_SEVERITY.SUCCESS,
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals['REQUEST_OK']
          });

          this.router.navigate(['/']);
        },
        error: () => {
          this.toastService.add({
            severity: TOAST_SEVERITY.ERROR,
            summary: this.translateService.instant('TOAST.ERROR'),
            detail: this.literals['REQUEST_KO']
          });
        }
      })
  }

  private initForm(): void {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.EMAIL)])
    });
  }

  private checkDefaultConfig(): void {
    this.config.showConfigurator = this.config?.showConfigurator !== undefined ? this.config.showConfigurator : false;

    this.config.headerConfig = this.config?.headerConfig ?? {};
    this.config.headerConfig.showLogo = this.config.headerConfig?.showLogo !== undefined ? this.config.headerConfig.showLogo : true;
    this.config.headerConfig.logoUrl = this.config?.headerConfig?.logoUrl ?? '/assets/images/logo.png';
    this.config.headerConfig.logoText = this.config.headerConfig?.logoText ?? '';
    this.config.headerConfig.logoRedirect = this.config.headerConfig?.logoRedirect ?? '';
    this.config.headerConfig.logoCssClass = this.config.headerConfig?.logoCssClass ?? 'w-32';
    this.config.headerConfig.title = this.config.headerConfig?.title ?? 'Forgot Password';
    this.config.headerConfig.subTitle = this.config.headerConfig?.subTitle ?? 'Enter your email address to reset your password';

    this.config.emailLabel = this.config?.emailLabel ?? 'Email';
    this.config.emailPlaceholder = this.config?.emailPlaceholder ?? 'Email address';
    this.config.linkEnabled = this.config?.linkEnabled ?? true;
    this.config.linkLabel = this.config?.linkLabel ?? 'Go to login?';
    this.config.linkUrl = this.config?.linkUrl ?? '/auth/login';
    this.config.buttonLabel = this.config?.buttonLabel ?? 'Reset Password';
    this.config.formErrors = {
      email: this.config?.formErrors?.email ?? {},
    };
  }

  private setCustomConfig(): void {
    this.config.headerConfig.title = this.literals['TITLE'];
    this.config.headerConfig.subTitle = this.literals['SUB_TITLE'];
    this.config.emailLabel = this.literals['EMAIL_LABEL'];
    this.config.emailPlaceholder = this.literals['EMAIL_PLACEHOLDER'];
    this.config.linkEnabled = this.config?.linkEnabled ?? true;
    this.config.linkLabel = this.literals['LINK_LABEL'];
    this.config.linkUrl = this.config?.linkUrl ?? '/auth/login';
    this.config.buttonLabel = this.literals['BUTTON_LABEL'];
  }

  private setConfigFormErrors(): void {
    this.config.formErrors = {
      email: {
        formControl: this.forgotPasswordForm.get('email'),
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals['ERROR']['EMAIL'] },
          { error: INPUT_ERROR.PATTERN, message: this.literals['ERROR']['EMAIL_INVALID'] }
        ]
      }
    };
  }
}
