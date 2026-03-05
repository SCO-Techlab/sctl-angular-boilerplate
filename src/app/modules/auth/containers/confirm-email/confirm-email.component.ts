import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthCardComponent } from '@modules/auth/components';
import { IAuthCardComponent } from '@modules/auth/interfaces';
import { AuthService } from '@modules/auth/services';
import { ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { SpinnerService, TranslateService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-confirm-email',
  standalone: true,
  templateUrl: './confirm-email.component.html',
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    MessageModule,
    AuthCardComponent
  ],
})
export class ConfirmEmailComponent implements OnInit {

  public cardConfig: IAuthCardComponent = {};
  public isError: boolean = false;
  public resultMessage: string = '';

  private literals: ITranslateLiterals;

  private destroyRef$ = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translateService = inject(TranslateService);
  private authService = inject(AuthService);
  private spinnerService = inject(SpinnerService);
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.translateService.stream('AUTH.CONFIRM_EMAIL')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.cardConfig = this.authService.setCardConfig(this.literals['TITLE'], this.literals['SUB_TITLE']);
        this.subscribeToQueryParams();
      });
  }

  public onClickButton(): void {
    this.router.navigate(['/auth/login']);
  }

  private subscribeToQueryParams(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((params: Params) => {
        this.findUser(params['email']);
      });
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
            this.setResult(true, this.literals['CONFIRM_EMAIL_KO'])
            return;
          }

          if (result.emailConfirmed && result.emailConfirmedAt) {
            this.setResult(false, this.literals['ALREADY_CONFIRMED'])
            return;
          }

          this.confirmUser(email);
        },
        error: () => this.setResult(true, this.literals['CONFIRM_EMAIL_KO'])
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
        next: (result: boolean) => this.setResult(
          !result ? true : false,
          !result ? this.literals['CONFIRM_EMAIL_KO'] : this.literals['CONFIRM_EMAIL_OK']
        ),
        error: () => this.setResult(true, this.literals['CONFIRM_EMAIL_KO'])
      })
  }

  private setResult(isError: boolean, resultMessage: string): void {
    this.isError = isError;
    this.resultMessage = resultMessage;
  }
}
