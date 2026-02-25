import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { InputErrorComponent } from '../../../shared/components';
import { MAGIC_NUMBERS, REGEX_PATTERNS } from '../../../shared/constants';
import { ILayoutLogin, ILayoutLoginEvent } from '../../interfaces';
import { FloatingConfigurator } from '../floatingconfigurator';

@Component({
  selector: 'sctl-login',
  standalone: true,
  templateUrl: './login.html',
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
    FloatingConfigurator,
    InputErrorComponent,
  ],
})
export class Login implements OnInit {

  @Input() config: ILayoutLogin = {};
  @Output() login = new EventEmitter<ILayoutLoginEvent>();
  @Output() forgotPassword = new EventEmitter<void>();

  public loginForm: FormGroup;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.initConfig();
    this.initForm();
    this.setRememberedInitialValues();
    this.setFormControlsErrors();
  }

  onClickLogo(): void {
    if (this.config?.logoRedirect) {
      this.router.navigate([this.config?.logoRedirect]);
    }
  }

  onClickForgotPassword(): void {
    this.forgotPassword.emit();
  }

  onClickButton(rememberMeLogin: boolean = false): void {
    const event: ILayoutLoginEvent = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('rememberMe')?.value,
      rememberMeLogin
    };
    this.login.emit(event);
  }

  private initConfig(): void {
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
  }

  private initForm(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.EMAIL)]),
      password: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]),
      rememberMe: new FormControl(false)
    });
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

    const form = this.loginForm.value;
    if (form.rememberMe && form.email && form.password) {
      this.onClickButton(true);
    } else {
      this.loginForm.setValue({
        email: '',
        password: '',
        rememberMe: false
      });
    }
  }

  private setFormControlsErrors(): void {
    if (
      this.config?.formErrors?.email.errorsToShow?.length > MAGIC_NUMBERS.N_0 ||
      this.config?.formErrors?.password.errorsToShow?.length > MAGIC_NUMBERS.N_0
    ) {
      this.config.formErrors.email.formControl = this.loginForm.get('email');
      this.config.formErrors.password.formControl = this.loginForm.get('password');
    }
  }
}
