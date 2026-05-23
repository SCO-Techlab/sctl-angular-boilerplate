import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SessionStorageState, SetDarkMode, SetStaticMenu } from '@core/session-storage';
import { TranslateModule } from '@core/shared/modules';
import { LayoutService } from '@core/shared/services';
import { ProfileService } from '@modules/profile/services';
import { Store } from '@ngxs/store';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProfileFormComponent } from '../profile-form';

@Component({
  selector: 'sctl-profile-configuration',
  standalone: true,
  templateUrl: './profile-configuration.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ToggleSwitchModule,
    ProfileFormComponent
  ]
})
export class ProfileConfigurationComponent {

  public lockForm: boolean = true;
  public configurationForm: FormGroup;

  private store = inject(Store);
  private layoutService = inject(LayoutService);
  private profileService = inject(ProfileService);

  ngOnInit(): void {
    this.initForm();
    this.fillForm();
  }

  public onClickLockOrUnlockForm(): void {
    this.lockForm = !this.lockForm;
    this.profileService.disableOrEnableForm(this.configurationForm, this.lockForm);
  }

  public onChangeDarkTheme(): void {
    const darkTheme: boolean = this.configurationForm.value.darkTheme;
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: darkTheme }));
    this.store.dispatch(new SetDarkMode({ darkMode: darkTheme }));
  }

  public onChangeStaticMenu(): void {
    const staticMenu: boolean = this.configurationForm.value.staticMenu;
    this.layoutService.layoutConfig.update((state) => ({ ...state, menuMode: staticMenu ? 'static' : 'overlay' }));
    this.store.dispatch(new SetStaticMenu({ staticMenu: staticMenu }));
  }

  private initForm(): void {
    this.configurationForm = new FormGroup({
      darkTheme: new FormControl(),
      staticMenu: new FormControl()
    });

    this.profileService.disableOrEnableForm(this.configurationForm, true);
  }

  private fillForm(): void {
    const darkTheme: boolean = this.store.selectSnapshot(SessionStorageState.darkMode);
    const staticMenu: boolean = this.store.selectSnapshot(SessionStorageState.staticMenu);

    this.configurationForm.setValue({
      darkTheme: darkTheme,
      staticMenu: staticMenu
    });
  }
}
