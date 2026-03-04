import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { AuthCardComponent } from '@modules/auth/components';
import { IAuthConfirmEmailComponent } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { FloatingThemeConfigurator } from '@shared/components';
import { ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { SpinnerService, TranslateService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-confirm-email',
  standalone: true,
  templateUrl: './confirm-email.component.html',
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
    TranslateModule,
    AuthCardComponent,
    MessageModule
  ],
})
export class ConfirmEmailComponent implements OnInit {

  public config: IAuthConfirmEmailComponent = {};
  public literals: ITranslateLiterals;
  public isError: boolean = false;
  public resultMessage: string = '';

  private destroyRef$ = inject(DestroyRef);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService);
  private spinnerService = inject(SpinnerService);
  private route = inject(ActivatedRoute);
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.translateService.stream('AUTH.CONFIRM_EMAIL')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setConfig();
        this.initCoponent();
      });
  }

  onClickLink(url: string): void {
    if (url) {
      this.router.navigate([url]);
    }
  }

  private initCoponent(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((params: Params) => {
        this.findUser(params['email']);
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

    this.config.successMessage = this.literals['CONFIRM_EMAIL_OK'];
    this.config.errorMessage = this.literals['CONFIRM_EMAIL_KO'];
    this.config.buttonLabel = this.literals['BUTTON_LABEL'];
    this.config.buttonRedirect = '/auth/login';
  }

  private findUser(email: string): void {
    this.spinnerService.show();
    this.authService.findUser(email)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => {
          if (this.resultMessage !== '') {
            this.spinnerService.hide();
            this.cdRef.detectChanges();
          }
        }),
      )
      .subscribe({
        next: (result: IUser) => {
          if (!result) {
            this.isError = true;
            this.resultMessage = this.literals['CONFIRM_EMAIL_KO'];
            return;
          }

          if (result.emailConfirmed && result.emailConfirmedAt) {
            this.isError = false;
            this.resultMessage = this.literals['ALREADY_CONFIRMED'];
            return;
          }

          this.confirmUser(email);
        },
        error: () => {
          this.isError = true;
          this.resultMessage = this.literals['CONFIRM_EMAIL_KO'];
        }
      })
  }

  private confirmUser(email: string): void {
    this.authService.confirmEmail(email)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => {
          this.spinnerService.hide();
          this.cdRef.detectChanges();
        })
      )
      .subscribe({
        next: (result: boolean) => {
          if (!result) {
            this.isError = true;
            this.resultMessage = this.literals['CONFIRM_EMAIL_KO'];
            return;
          }

          this.isError = false;
          this.resultMessage = this.literals['CONFIRM_EMAIL_OK'];
        },
        error: () => {
          this.isError = true;
          this.resultMessage = this.literals['CONFIRM_EMAIL_KO'];
        }
      })
  }
}
