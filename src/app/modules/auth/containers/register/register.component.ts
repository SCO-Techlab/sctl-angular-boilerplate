import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputErrorComponent } from '@core/components';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent } from '@core/shared/interfaces';
import { AuthCardComponent, AuthLinksComponent } from '@modules/auth/components';
import { setAuthCardConfig } from '@modules/auth/helpers';
import { IAuthCardComponent, IAuthInput, IAuthLinksComponent } from '@modules/auth/interfaces';
import { REGEX_PATTERNS } from '@shared/constants';
import { ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { AuthService, SpinnerService, ToastService, TranslateService } from '@shared/services';
import { PasswordMatchValidator } from '@shared/validators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    AuthCardComponent,
    AuthLinksComponent,
    InputErrorComponent
  ],
})
export class RegisterComponent implements OnInit {

  public cardConfig: IAuthCardComponent = {};
  public linksConfig: IAuthLinksComponent = {};
  public registerForm: FormGroup;
  public inputs: { [key: string]: IAuthInput } = {};
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;

  private destroyRef$ = inject(DestroyRef);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initForm();

    this.translateService.stream('AUTH.REGISTER')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.cardConfig = setAuthCardConfig(this.literals['TITLE'], this.literals['SUB_TITLE']);
        this.setInputs();
        this.setLinks();
        this.setFormErrors();
      });
  }

  public onClickLink(url: string): void {
    if (url) {
      this.router.navigate([url]);
    }
  }

  public onClickButton(): void {
    const formValue: Partial<IUser> = this.registerForm.value;

    const user: Partial<IUser> = {
      email: formValue.email,
      userName: formValue.userName,
      personalName: formValue.personalName,
      password: formValue.password,
      active: false,
      role: {
        name: 'USER'
      }
    };

    this.spinnerService.show();
    this.authService.register(user as IUser)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (result: boolean) => {
          if (!result) {
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['REGISTER_KO'] });
            return;
          }

          this.toastService.success({ summary: this.translateService.instant('TOAST.SUCCESS'), detail: this.literals['REGISTER_OK'] });
          this.router.navigate(['/auth/login']);
        },
        error: (error: HttpErrorResponse) => {
          let detail: string = this.literals['REGISTER_KO'];

          if (error.error.message === 'User with email already exists') {
            detail = this.literals['REGISTER_KO_403_EMAIL_EXISTS'];
          } else if (error.error.message === 'User with userName already exists') {
            detail = this.literals['REGISTER_KO_403_USERNAME_EXISTS'];
          } else if (error.error.message === 'Role not found') {
            detail = this.literals['REGISTER_KO_403_ROLE_NOT_FOUND'];
          } else if (error.error.message === 'Error sending registration email') {
            detail = this.literals['REGISTER_KO_403_EMAIL_NOT_SEND'];
          }

          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail });
        }
      })
  }

  private initForm(): void {
    this.registerForm = new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.EMAIL)]),
        userName: new FormControl('', [Validators.required]),
        personalName: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)])
      },
      { validators: [PasswordMatchValidator] }
    );
  }

  private setInputs(): void {
    this.inputs = {
      email: {
        label: this.literals['EMAIL_LABEL'],
        placeholder: this.literals['EMAIL_PLACEHOLDER'],
        disabled: false
      },
      userName: {
        label: this.literals['USERNAME_LABEL'],
        placeholder: this.literals['USERNAME_PLACEHOLDER'],
        disabled: false
      },
      personalName: {
        label: this.literals['PERSONAL_NAME_LABEL'],
        placeholder: this.literals['PERSONAL_NAME_PLACEHOLDER'],
        disabled: false
      },
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

  private setLinks(): void {
    this.linksConfig = {
      links: [
        {
          linkLabel: this.literals['LINK_LABEL'],
          linkUrl: '/auth/login'
        },
        {
          linkLabel: this.literals['LINK_LABEL_FORGOT_PASSWORD'],
          linkUrl: '/auth/forgot-password'
        }
      ]
    };
  }

  private setFormErrors(): void {
    this.formErrors = {
      email: {
        formControl: this.registerForm.get('email'),
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
      userName: {
        formControl: this.registerForm.get('username'),
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['USERNAME']
          }
        ]
      },
      personalName: {
        formControl: this.registerForm.get('personalName'),
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['PERSONAL_NAME']
          }
        ]
      },
      password: {
        formControl: this.registerForm.get('password'),
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
        formControl: this.registerForm.get('confirmPassword'),
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
