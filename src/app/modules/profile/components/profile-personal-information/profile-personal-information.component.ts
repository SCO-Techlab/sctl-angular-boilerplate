import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '@modules/profile/services';
import { Store } from '@ngxs/store';
import { SetAccessToken } from '@session-storage';
import { DATES, MAGIC_NUMBERS } from '@shared/constants';
import { IJwtToken, ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { DatesService, JwtTokenService, SpinnerService, ToastService, TranslateService } from '@shared/services';
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
    ProfileFormComponent
  ]
})
export class ProfilePersonalInformationComponent implements OnInit {
  public user = input<IUser>();

  public personalInformationForm: FormGroup;
  public lockForm: boolean = true;
  public lockState: any = undefined;

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
      .subscribe((res: ITranslateLiterals) => this.literals = res);
  }

  public onClickLockOrUnlockForm(): void {
    this.lockForm = !this.lockForm;
    this.profileService.disableOrEnableForm(this.personalInformationForm, this.lockForm);

    const formValues: any = this.personalInformationForm.value;
    if (this.lockForm) {
      this.personalInformationForm.setValue(this.lockState);
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
          this.lockState = undefined;
          this.profileService.disableOrEnableForm(this.personalInformationForm, this.lockForm);
          this.toastService.success({ summary: this.translateService.instant('TOAST.SUCCESS'), detail: this.literals['REQUEST_OK'] });
        },
        error: () => {
          this.toastService.error({ summary: this.translateService.instant('TOAST.ERROR'), detail: this.literals['REQUEST_KO'] });
        }
      });
  }

  private initForm(): void {
    this.personalInformationForm = new FormGroup({
      personalName: new FormControl(this.user()?.personalName ?? ''),
      userName: new FormControl(this.user()?.userName ?? ''),
      email: new FormControl(this.user()?.email ?? ''),
      role: new FormControl(this.formatRoleName() ?? ''),
      createdAt: new FormControl(this.datesService.formatDate(DATES.ISO_DATE, this.user()?.createdAt) ?? '')
    });

    this.profileService.disableOrEnableForm(this.personalInformationForm, this.lockForm);
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
}
