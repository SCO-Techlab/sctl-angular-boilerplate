import { CommonModule } from '@angular/common';
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
import { IInputErrorComponent, ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { SpinnerService, ToastService, TranslateService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    AuthCardComponent,
    AuthLinksComponent,
    InputErrorComponent
  ],
})
export class ForgotPasswordComponent implements OnInit {

  public cardConfig: IAuthCardComponent = {};
  public linksConfig: IAuthLinksComponent = {};
  public forgotPasswordForm: FormGroup;
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

    this.translateService.stream('AUTH.FORGOT_PASSWORD')
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
              detail: this.literals['FORGOT_PASSWORD_KO']
            });
            return;
          }

          this.toastService.add({
            severity: TOAST_SEVERITY.SUCCESS,
            summary: this.translateService.instant('TOAST.SUCCESS'),
            detail: this.literals['FORGOT_PASSWORD_OK']
          });

          this.router.navigate(['/']);
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

  private initForm(): void {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.EMAIL)])
    });
  }

  private setInputs(): void {
    this.inputs = {
      email: {
        label: this.literals['EMAIL_LABEL'],
        placeholder: this.literals['EMAIL_PLACEHOLDER'],
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
          linkLabel: this.literals['LINK_REGISTER_LABEL'],
          linkUrl: '/auth/register'
        }
      ]
    };
  }

  private setFormErrors(): void {
    this.formErrors = {
      email: {
        formControl: this.forgotPasswordForm.get('email'),
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
      }
    };
  }
}
