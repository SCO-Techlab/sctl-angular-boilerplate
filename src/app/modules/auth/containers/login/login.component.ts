import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { AuthCardComponent } from '@modules/auth/components';
import { ILoginComponent, ILoginComponentEvent } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { Store } from '@ngxs/store';
import { SessionStorageState, SetRememberUser, SetToken } from 'src/app/session-storage';
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
import { finalize } from 'rxjs';

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
    TranslateModule,
    AuthCardComponent
  ],
})
export class LoginComponent implements OnInit {

  public config: ILoginComponent = {};
  public loginForm: FormGroup;

  private literals: ITranslateLiterals;

  private destroyRef$ = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initForm();

    this.translateService.stream('AUTH.LOGIN')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.subscribeToQueryParams();
        this.setConfig();
        this.setForInitialValues();
      });
  }

  onClickLink(url: string): void {
    if (url) {
      this.router.navigate([url]);
    }
  }

  onClickButton(): void {
    const event: ILoginComponentEvent = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('rememberMe')?.value
    };

    this.spinnerService.show();
    this.authService.logIn(event)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (jwtToken: IJwtToken) => {
          if (!jwtToken?.accessToken) {
            this.toastService.add({
              severity: TOAST_SEVERITY.ERROR,
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals['LOGIN_KO_401']
            });
            return;
          }

          this.store.dispatch(new SetToken({ token: { ...jwtToken } }));

          this.store.dispatch(new SetRememberUser({
            rememberUser: !event.rememberMe 
              ? undefined 
              : { email: event.email, password: event.password },
          }));

          this.toastService.add({
            severity: TOAST_SEVERITY.SUCCESS,
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals['LOGIN_OK']
          });

          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          const detail: string = error.status === MAGIC_NUMBERS.N_401
            ? this.literals['LOGIN_KO_401']
            : error.status === MAGIC_NUMBERS.N_403
              ? this.literals['LOGIN_KO_403']
              : this.literals['LOGIN_KO'];

          this.toastService.add({
            severity: TOAST_SEVERITY.ERROR,
            summary: this.translateService.instant('TOAST.ERROR'),
            detail
          });
        }
      })
  }

  private subscribeToQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((params: Params) => {
        const reason: string = params['reason'];

        if (reason === 'expired') {
          
        }

        if (reason) {
          const detail: string = reason === 'expired'
            ? this.literals['LOGIN_KO_401_EXPIRED']
            : this.literals['LOGIN_SESSION_CLOSED'];

          const severity: TOAST_SEVERITY = reason === 'expired'
            ? TOAST_SEVERITY.ERROR
            : TOAST_SEVERITY.SUCCESS;

          this.toastService.add({
            severity,
            summary: this.translateService.instant('TOAST.ERROR'),
            detail
          });

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true 
          });
        }
      });
  }

  private initForm(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.EMAIL)]),
      password: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]),
      rememberMe: new FormControl(false)
    });
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
      email: { label: this.literals['EMAIL_LABEL'], placeholder: this.literals['EMAIL_PLACEHOLDER'], disabled: false },
      password: { label: this.literals['PASSWORD_LABEL'], placeholder: this.literals['PASSWORD_PLACEHOLDER'], disabled: false },
      rememberMe: { label: this.literals['REMEMBER_ME'], placeholder: '', disabled: false }
    };

    this.config.links = [
      { linkLabel: this.literals['FORGOT_PASSWORD'], linkUrl: '/auth/forgot-password' },
      { linkLabel: this.literals['REGISTER'], linkUrl: '/auth/register' }
    ];

    this.config.buttonLabel = this.literals['BUTTON_LABEL'];

    const rememberUser: { email: string, password: string } | undefined = this.store.selectSnapshot(SessionStorageState.rememberUser);
    this.config.initialValues = {
      email: rememberUser?.email ?? '',
      password: rememberUser?.password ?? '',
      rememberMe: rememberUser !== undefined
    };

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

  private setForInitialValues(): void {
    if (this.config.inputs?.rememberMe?.disabled || !this.config?.initialValues) {
      return;
    }

    this.loginForm.setValue({
      email: this.config?.initialValues?.email ?? '',
      password: this.config?.initialValues?.password ?? '',
      rememberMe: this.config?.initialValues?.rememberMe ?? false
    });
  }
}
