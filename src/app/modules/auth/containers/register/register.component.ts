import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthCardComponent, AuthLinksComponent } from '@modules/auth/components';
import { IAuthCardComponent, IAuthInput, IAuthLinksComponent } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { InputErrorComponent } from '@shared/components';
import { REGEX_PATTERNS } from '@shared/constants';
import { INPUT_ERROR, TOAST_SEVERITY } from '@shared/enums';
import { IInputErrorComponent, ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { SpinnerService, ToastService, TranslateService } from '@shared/services';
import { passwordMatchValidator } from '@shared/validators';
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
        this.cardConfig = this.authService.setCardConfig(this.literals['TITLE'], this.literals['SUB_TITLE']);
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
    const email: string = this.registerForm.get('email')?.value ?? '';
    const password: string = this.registerForm.get('password')?.value ?? '';

    const user: Partial<IUser> = {
      email: email,
      password: password,
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
            this.toastService.add({
              severity: TOAST_SEVERITY.ERROR,
              summary: this.translateService.instant('TOAST.ERROR'),
              detail: this.literals['REGISTER_KO']
            });
            return;
          }

          this.toastService.add({
            severity: TOAST_SEVERITY.SUCCESS,
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals['REGISTER_OK']
          });

          this.router.navigate(['/auth/login']);
        },
        error: (error: HttpErrorResponse) => {
          let detail: string = this.literals['REGISTER_KO'];

          detail = error.error.message === 'User with email already exists'
            ? this.literals['REGISTER_KO_403_EMAIL_EXISTS']
            : error.error.message === 'Role not found'
              ? this.literals['REGISTER_KO_403_ROLE_NOT_FOUND']
              : error.error.message === 'Error sending registration email'
                ? this.literals['REGISTER_KO_403_EMAIL_NOT_SEND']
                : this.literals['REGISTER_KO'];

          this.toastService.add({
            severity: TOAST_SEVERITY.ERROR,
            summary: this.translateService.instant('TOAST.ERROR'),
            detail
          });
        }
      })
  }

  private initForm(): void {
    this.registerForm = new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.EMAIL)]),
        password: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.PASSWORD)])
      },
      { validators: [passwordMatchValidator] }
    );
  }

  private setInputs(): void {
    this.inputs = {
      email: {
        label: this.literals['EMAIL_LABEL'],
        placeholder: this.literals['EMAIL_PLACEHOLDER'],
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
