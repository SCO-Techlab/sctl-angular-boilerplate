import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, inject, TemplateRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfileChangePasswordComponent, ProfileConfigurationComponent, ProfileHeaderComponent, ProfilePersonalInformationComponent } from '@modules/profile/components';
import { PROFILE_TABS } from '@modules/profile/enums';
import { ProfileService } from '@modules/profile/services';
import { CardComponent } from '@shared/components';
import { CONFIRM_DIALOG_ICONS } from '@shared/constants';
import { BUTTON_SEVERITY } from '@shared/enums';
import { IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfirmDialogService, SpinnerService, ToastService, TranslateService, UserService } from '@shared/services';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { finalize } from 'rxjs';

@Component({
  selector: 'sctl-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  imports: [
    CommonModule,
    TranslateModule,
    CardComponent,
    ProfileHeaderComponent,
    TabsModule,
    ButtonModule,
    ProfilePersonalInformationComponent,
    ProfileChangePasswordComponent,
    ProfileConfigurationComponent
  ]
})
export class ProfileComponent implements AfterViewInit {
  @ViewChild('personalInformation') personalInformation!: TemplateRef<ProfilePersonalInformationComponent>;
  @ViewChild('changePassword') changePassword!: TemplateRef<ProfileChangePasswordComponent>;
  @ViewChild('configuration') configuration!: TemplateRef<ProfileConfigurationComponent>;

  public PROFILE_TABS = PROFILE_TABS;
  public currentTab = PROFILE_TABS.PERSONAL_INFORMATION;
  public currentTabTemplate: TemplateRef<any>;

  public get user(): IUser {
    return this.userService.loggedUser();
  }

  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private userService = inject(UserService);
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);
  private spinnerService = inject(SpinnerService);
  private confirmDialogService = inject(ConfirmDialogService);
  private cdRef = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    this.setTabTemplate();
    this.cdRef.detectChanges();
  }

  public onTabChange($event: string | number): void {
    if ($event === this.currentTab) {
      return;
    }

    this.currentTab = $event as PROFILE_TABS;
    this.setTabTemplate();
  }

  public onDeleteAccount(): void {
    this.confirmDialogService.confirm({
      header: this.translateService.instant('PROFILE.DELETE_ACCOUNT_CONFIRM.HEADER'),
      message: this.translateService.instant('PROFILE.DELETE_ACCOUNT_CONFIRM.MESSAGE'),
      icon: CONFIRM_DIALOG_ICONS.WARNING,
      rejectButton: {
        label: this.translateService.instant('PROFILE.DELETE_ACCOUNT_CONFIRM.REJECT'),
        severity: BUTTON_SEVERITY.SECONDARY
      },
      acceptButton: {
        label: this.translateService.instant('PROFILE.DELETE_ACCOUNT_CONFIRM.ACCEPT'),
        severity: BUTTON_SEVERITY.DANGER
      },
      accept: () => {
        this.spinnerService.show();
        this.profileService.deleteUserAccount(this.user?._id)
          .pipe(
            takeUntilDestroyed(this.destroyRef$),
            finalize(() => this.spinnerService.hide())
          )
          .subscribe({
            next: (res: boolean) => {
              if (!res) {
                this.toastService.error({
                  summary: this.translateService.instant('TOAST.ERROR'),
                  detail: this.translateService.instant('PROFILE.DELETE_ACCOUNT_KO')
                });
                return;
              }

              this.toastService.success({
                summary: this.translateService.instant('TOAST.SUCCESS'),
                detail: this.translateService.instant('PROFILE.DELETE_ACCOUNT_OK')
              });
              this.userService.logout({ reason: 'delete', deleteRefreshToken: true });
            },
            error: () => {
              this.toastService.error({
                summary: this.translateService.instant('TOAST.ERROR'),
                detail: this.translateService.instant('PROFILE.DELETE_ACCOUNT_KO')
              });
            }
          });
      }
    });
  }

  private setTabTemplate(): void {
    if (this.currentTab === PROFILE_TABS.CONFIGURATION) {
      this.currentTabTemplate = this.configuration;
    } else if (this.currentTab === PROFILE_TABS.CHANGE_PASSWORD) {
      this.currentTabTemplate = this.changePassword;
    } else {
      this.currentTabTemplate = this.personalInformation;
    }
  }
}
