import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorComponent } from '@core/components';
import { SetAccessToken } from '@core/session-storage';
import { DATES, MAGIC_NUMBERS } from '@core/shared/constants';
import { INPUT_ERROR } from '@core/shared/enums';
import { IInputErrorComponent, ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { DatesService, SpinnerService, ToastService, TranslateService } from '@core/shared/services';
import { ProfileService } from '@modules/profile/services';
import { Store } from '@ngxs/store';
import { REGEX_PATTERNS } from '@shared/constants';
import { IJwtToken, IUser } from '@shared/interfaces';
import { JwtTokenService } from '@shared/services';
import { InputTextModule } from 'primeng/inputtext';
import { finalize } from 'rxjs';
import { ProfileFormComponent } from '../profile-form';

@Component({
  selector: 'sctl-profile-personal-information',
  standalone: true,
  templateUrl: './profile-personal-information.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextModule,
    ProfileFormComponent,
    InputErrorComponent
  ]
})
export class ProfilePersonalInformationComponent implements OnInit {
  public user = input<IUser>();

  public personalInformationForm: FormGroup;
  public lockForm: boolean = true;
  public lockState: any = undefined;
  public formErrors: { [key: string]: IInputErrorComponent } = {};

  private literals: ITranslateLiterals;

  private destroyRef$ = inject(DestroyRef);
  private store = inject(Store);
  private translateService = inject(TranslateService);
  private profileService = inject(ProfileService);
  private datesService = inject(DatesService);
  private spinnerService = inject(SpinnerService);
  private toastService = inject(ToastService);
  private tokenService = inject(JwtTokenService);

  ngOnInit(): void {
    this.initForm();

    this.translateService.stream('PROFILE.PERSONAL_INFORMATION')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.literals = res;
        this.setFormErrors();
      });
  }

  public onClickLockOrUnlockForm(): void {
    this.lockForm = !this.lockForm;
    this.profileService.disableOrEnableForm(this.personalInformationForm, this.lockForm);

    const formValues: any = this.personalInformationForm.value;
    if (this.lockForm) {
      this.personalInformationForm.setValue({ ...this.lockState });
    } else {
      this.lockState = formValues;
    }
  }

  public onClickSave(): void {
    const _id: string = this.user()?._id;
    const personalInformation: Partial<IUser> = {
      personalName: this.personalInformationForm.value.personalName,
      userName: this.personalInformationForm.value.userName,
    };

    this.spinnerService.show();
    this.profileService.updateUserInfo(_id, personalInformation)
      .pipe(
        takeUntilDestroyed(this.destroyRef$),
        finalize(() => this.spinnerService.hide())
      )
      .subscribe({
        next: (token: IJwtToken) => {
          if (!token?.accessToken) {
            this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['REQUEST_KO'] });
            return;
          }

          this.store.dispatch(new SetAccessToken({ accessToken: token.accessToken }));
          this.fillForm(this.tokenService.decodeToken(token.accessToken)?.user);
          this.lockForm = true;
          this.lockState = true;
          this.profileService.disableOrEnableForm(this.personalInformationForm, true);
          this.toastService.success({ summary: this.translateService.instant('TOAST.SUCCESS'), detail: this.literals['REQUEST_OK'] });
        },
        error: (error: HttpErrorResponse) => {
          let detail: string = this.literals['REQUEST_KO'];

          if (error.error.message === 'Duplicate key error collection (userName -> user)') {
            detail = this.literals['REQUEST_KO_USERNAME_EXISTS'];
          } else if (error.error.message === 'Duplicate key error collection (email -> user)') {
            detail = this.literals['REQUEST_KO_EMAIL_EXISTS'];
          }

          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail });
        }
      });
  }

  private initForm(): void {
    this.personalInformationForm = new FormGroup({
      personalName: new FormControl(this.user()?.personalName ?? '', [Validators.required]),
      userName: new FormControl(this.user()?.userName ?? '', [Validators.required]),
      email: new FormControl(this.user()?.email ?? '', [Validators.required, Validators.pattern(REGEX_PATTERNS.EMAIL)]),
      role: new FormControl(this.formatRoleName() ?? ''),
      createdAt: new FormControl(this.datesService.formatDate(DATES.ISO_DATE, this.user()?.createdAt) ?? '')
    });

    this.profileService.disableOrEnableForm(this.personalInformationForm, true);
  }

  private fillForm(user: IUser): void {
    this.personalInformationForm.setValue({
      personalName: user.personalName ?? '',
      userName: user.userName ?? '',
      email: user.email ?? '',
      role: user.role.name ?? '',
      createdAt: this.datesService.formatDate(DATES.ISO_DATE, user.createdAt) ?? ''
    });
  }

  private formatRoleName(): string {
    const role: string = this.user().role.name.toLowerCase();
    if (!role) {
      return '';
    }

    return role.charAt(MAGIC_NUMBERS.N_0).toUpperCase() + role.slice(MAGIC_NUMBERS.N_1);
  }

  private setFormErrors(): void {
    this.formErrors = {
      personalName: {
        formControl: this.personalInformationForm.get('personalName'),
        cssClass: 'mb-0',
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['PERSONAL_NAME']
          }
        ]
      },
      userName: {
        formControl: this.personalInformationForm.get('userName'),
        cssClass: 'mb-0',
        errorsToShow: [
          {
            error: INPUT_ERROR.REQUIRED,
            message: this.literals['ERROR']['USER_NAME']
          }
        ]
      },
      email: {
        formControl: this.personalInformationForm.get('email'),
        cssClass: 'mb-0',
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
