import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { ProfileChangePasswordComponent, ProfileConfigurationComponent, ProfileHeaderComponent, ProfilePersonalInformationComponent } from '@modules/profile/components';
import { PROFILE_TABS } from '@modules/profile/enums';
import { CardComponent } from '@shared/components';
import { IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { UserService } from '@shared/services';
import { TabsModule } from 'primeng/tabs';

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

  private userService = inject(UserService);

  ngAfterViewInit(): void {
    this.setTabTemplate();
  }

  public onTabChange($event: string | number): void {
    if ($event === this.currentTab) {
      return;
    }

    this.currentTab = $event as PROFILE_TABS;
    this.setTabTemplate();
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
