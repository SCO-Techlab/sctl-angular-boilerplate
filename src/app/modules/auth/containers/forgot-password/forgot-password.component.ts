import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthCardComponent } from '@modules/auth/components';
import { IForgotPasswordComponent } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { FloatingThemeConfigurator, InputErrorComponent } from '@shared/components';
import { MAGIC_NUMBERS, REGEX_PATTERNS } from '@shared/constants';
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

    this.translateService.stream('AUTH.FORGOT_PASSWORD')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setConfig();
      });
  }

  onClickLink(url: string): void {
    if (url) {
      this.router.navigate([url]);
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
      email: { label: this.literals['EMAIL_LABEL'], placeholder: this.literals['EMAIL_PLACEHOLDER'], disabled: false }
    };

    this.config.links = [
      { linkLabel: this.literals['LINK_LABEL'], linkUrl: '/auth/login' },
      { linkLabel: this.literals['LINK_REGISTER_LABEL'], linkUrl: '/auth/register' }
    ];

    this.config.buttonLabel = this.literals['BUTTON_LABEL'];

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
