import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthCardComponent, AuthLinksComponent } from '@modules/auth/components';
import { IAuthCardComponent, IAuthEvent, IAuthInput, IAuthLinksComponent } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { Store } from '@ngxs/store';
import { InputErrorComponent } from '@shared/components';
import { MAGIC_NUMBERS, REGEX_PATTERNS } from '@shared/constants';
import { INPUT_ERROR, TOAST_SEVERITY } from '@shared/enums';
import { IInputErrorComponent, IJwtToken, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { SpinnerService, ToastService, TranslateService, UserService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { finalize } from 'rxjs';
import { SessionStorageState, SetRememberUser, SetToken } from 'src/app/session-storage';

@Component({
  selector: 'sctl-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    AuthCardComponent,
    AuthLinksComponent,
    InputErrorComponent,
  ],
})
export class LoginComponent implements OnInit {

  public cardConfig: IAuthCardComponent = {};
  public linksConfig: IAuthLinksComponent = {};
  public loginForm: FormGroup;
  public inputs: { [key: string]: IAuthInput } = {};
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;

  private destroyRef$ = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.initForm();

    this.translateService.stream('AUTH.LOGIN')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.cardConfig = this.authService.setCardConfig(this.literals['TITLE'], this.literals['SUB_TITLE']);
        this.subscribeToQueryParams();
        this.setInputs();
        this.setLinks();
        this.setFormErrors();
        this.fillForm();
      });
  }

  public onClickButton(): void {
    const event: IAuthEvent = {
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
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['LOGIN_KO_401'] });
            return;
          }

          this.userService.login(jwtToken, event);
          this.toastService.success({ summary: this.translateService.instant('TOAST.SUCCESS'), detail: this.literals['LOGIN_OK'] });
        },
        error: (error: HttpErrorResponse) => {
          const detail: string = error.status === MAGIC_NUMBERS.N_401
            ? this.literals['LOGIN_KO_401']
            : error.status === MAGIC_NUMBERS.N_403
              ? this.literals['LOGIN_KO_403']
              : this.literals['LOGIN_KO'];

          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail });
        }
      })
  }

  private subscribeToQueryParams(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((params: Params) => {
        const reason: string = params['reason'];

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

  private setInputs(): void {
    this.inputs = {
      email: {
        label: this.literals['EMAIL_LABEL'], placeholder:
          this.literals['EMAIL_PLACEHOLDER'],
        disabled: false
      },
      password: {
        label: this.literals['PASSWORD_LABEL'],
        placeholder: this.literals['PASSWORD_PLACEHOLDER'],
        disabled: false
      },
      rememberMe: {
        label: this.literals['REMEMBER_ME'],
        placeholder: '',
        disabled: false
      }
    };
  }

  private setLinks(): void {
    this.linksConfig = {
      links: [
        {
          linkLabel: this.literals['FORGOT_PASSWORD'],
          linkUrl: '/auth/forgot-password'
        },
        {
          linkLabel: this.literals['REGISTER'],
          linkUrl: '/auth/register'
        }
      ]
    };
  }

  private setFormErrors(): void {
    this.formErrors = {
      email: {
        formControl: this.loginForm.get('email'),
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['EMAIL']
          },
          {
            error: INPUT_ERROR.PATTERN,
            message: this.literals['ERROR']['EMAIL_INVALID']
          }
        ]
      },
      password: {
        formControl: this.loginForm.get('password'),
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
      }
    };
  }

  private fillForm(): void {
    const rememberUser: { email: string, password: string } = this.store.selectSnapshot(SessionStorageState.rememberUser);
    if (rememberUser?.email && rememberUser?.password) {
      this.loginForm.setValue({
        email: rememberUser?.email ?? '',
        password: rememberUser?.password ?? '',
        rememberMe: rememberUser !== undefined
      });
    }
  }
}
