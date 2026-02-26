import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ILoginComponent, ILoginComponentEvent } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { Store } from '@ngxs/store';
import { PersistStorageState, SetAutoLogin, SetToken } from '@persist-storage';
import { FloatingThemeConfigurator, InputErrorComponent } from '@shared/components';
import { MAGIC_NUMBERS, REGEX_PATTERNS } from '@shared/constants';
import { INPUT_ERROR, TOAST_SEVERITY } from '@shared/enums';
import { IJwtToken, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { SpinnerService, ToastService, TranslateService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'sctl-login',
  standalone: true,
  templateUrl: './login.component.html',
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
    TranslateModule
  ],
})
export class LoginComponent implements OnInit {

  public config: ILoginComponent = {};
  public loginForm: FormGroup;

  private literals: ITranslateLiterals;
  private isAutoLogin: boolean = false;

  private destroyRef$ = inject(DestroyRef);
  private router = inject(Router);
  private store = inject(Store);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initForm();
    this.checkDefaultConfig();

    this.translateService.stream('AUTH.LOGIN')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setCustomConfig();
        this.setRememberedInitialValues();
        this.setConfigFormErrors();
      });
  }

  onClickLogo(): void {
    if (this.config?.logoRedirect) {
      this.router.navigate([this.config?.logoRedirect]);
    }
  }

  onClickForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  onClickButton(): void {
    const event: ILoginComponentEvent = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('rememberMe')?.value,
      autoLogin: this.isAutoLogin
    };

    const request$ = this.isAutoLogin
      ? this.authService.refreshToken(event.email, event.password, false)
      : this.authService.logIn(event);
    this.isAutoLogin = false;

    this.spinnerService.show();
    request$
      .pipe(
        take(MAGIC_NUMBERS.N_1),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (jwtToken: IJwtToken) => {
          if (!jwtToken?.accessToken) {
            this.toastService.add({
              severity: TOAST_SEVERITY.ERROR,
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals['LOGIN_KO_401'],
              life: MAGIC_NUMBERS.N_3000
            });
            return;
          }

          this.store.dispatch(new SetToken({
            token: {
              ...jwtToken,
              refreshToken: undefined
            }
          }));

          this.store.dispatch(new SetAutoLogin({
            autoLogin: !event.rememberMe ? undefined : { email: event.email, password: jwtToken.refreshToken },
            delete: !event.rememberMe
          }));

          this.toastService.add({
            severity: TOAST_SEVERITY.SUCCESS,
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals['LOGIN_OK'],
            life: MAGIC_NUMBERS.N_3000
          });

          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          const detail: string = error.status === MAGIC_NUMBERS.N_401
            ? this.literals['LOGIN_KO_401']
            : this.literals['LOGIN_KO'];

          this.toastService.add({
            severity: TOAST_SEVERITY.ERROR,
            summary: this.translateService.instant('TOAST.ERROR'),
            detail,
            life: MAGIC_NUMBERS.N_3000
          });
        }
      })
  }

  private initForm(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.EMAIL)]),
      password: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]),
      rememberMe: new FormControl(false)
    });
  }

  private checkDefaultConfig(): void {
    this.config.showConfigurator = this.config?.showConfigurator !== undefined ? this.config.showConfigurator : false;
    this.config.showLogo = this.config?.showLogo !== undefined ? this.config.showLogo : true;
    this.config.logoUrl = this.config?.logoUrl ?? undefined;
    this.config.logoText = this.config?.logoText ?? '';
    this.config.logoRedirect = this.config?.logoRedirect ?? '';
    this.config.logoCssClass = this.config?.logoCssClass ?? 'w-32';
    this.config.title = this.config?.title ?? 'Sign In';
    this.config.subTitle = this.config?.subTitle ?? 'Sign in to continue';
    this.config.emailLabel = this.config?.emailLabel ?? 'Email';
    this.config.emailPlaceholder = this.config?.emailPlaceholder ?? 'Email address';
    this.config.passwordLabel = this.config?.passwordLabel ?? 'Password';
    this.config.passwordPlaceholder = this.config?.passwordPlaceholder ?? 'Password';
    this.config.rememberMeEnabled = this.config?.rememberMeEnabled ?? true;
    this.config.rememberMeLabel = this.config?.rememberMeLabel ?? 'Remember me';
    this.config.forgotPasswordEnabled = this.config?.forgotPasswordEnabled ?? true;
    this.config.forgotPasswordLabel = this.config?.forgotPasswordLabel ?? 'Forgot password?';
    this.config.buttonLabel = this.config?.buttonLabel ?? 'Sign In';
    this.config.initialValues = {
      email: this.config?.initialValues?.email ?? '',
      password: this.config?.initialValues?.password ?? '',
      rememberMe: this.config?.initialValues?.rememberMe ?? false
    };
    this.config.formErrors = {
      email: this.config?.formErrors?.email ?? {},
      password: this.config?.formErrors?.password ?? {}
    };
  }

  private setCustomConfig(): void {
    this.config.title = this.literals['TITLE'];
    this.config.subTitle = this.literals['SUB_TITLE'];
    this.config.emailLabel = this.literals['EMAIL_LABEL'];
    this.config.emailPlaceholder = this.literals['EMAIL_PLACEHOLDER'];
    this.config.passwordLabel = this.literals['PASSWORD_LABEL'];
    this.config.passwordPlaceholder = this.literals['PASSWORD_PLACEHOLDER'];
    this.config.rememberMeEnabled = this.config?.rememberMeEnabled ?? true;
    this.config.rememberMeLabel = this.literals['REMEMBER_ME'];
    this.config.forgotPasswordEnabled = this.config?.forgotPasswordEnabled ?? true;
    this.config.forgotPasswordLabel = this.literals['FORGOT_PASSWORD'];
    this.config.buttonLabel = this.literals['BUTTON_LABEL'];

    const autoLogin: { email: string, password: string } | undefined = this.store.selectSnapshot(PersistStorageState.autoLogin);
    this.isAutoLogin = autoLogin !== undefined;
    this.config.initialValues = {
      email: autoLogin?.email ?? '',
      password: autoLogin?.password ?? '',
      rememberMe: autoLogin !== undefined
    };
  }

  private setRememberedInitialValues(): void {
    if (!this.config.rememberMeEnabled || !this.config?.initialValues) {
      return;
    }

    this.loginForm.setValue({
      email: this.config?.initialValues?.email ?? '',
      password: this.config?.initialValues?.password ?? '',
      rememberMe: this.config?.initialValues?.rememberMe ?? false
    });

    this.loginForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => this.isAutoLogin = false);
  }

  private setConfigFormErrors(): void {
    this.config.formErrors = {
      email: {
        formControl: this.loginForm.get('email'),
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals['ERROR']['EMAIL'] },
          { error: INPUT_ERROR.PATTERN, message: this.literals['ERROR']['EMAIL_INVALID'] }
        ]
      },
      password: {
        formControl: this.loginForm.get('password'),
        errorsToShow: [
          { error: INPUT_ERROR.REQUIRED, message: this.literals['ERROR']['PASSWORD'] },
          { error: INPUT_ERROR.PATTERN, message: this.literals['ERROR']['PASSWORD_INVALID'] }
        ]
      }
    };
  }
}
