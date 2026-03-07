import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '@modules/profile/services';
import { Store } from '@ngxs/store';
import { SessionStorageState, SetDarkMode } from '@session-storage';
import { TranslateModule } from '@shared/modules';
import { LayoutService } from '@shared/services';
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

  public configurationForm: FormGroup;

  private store = inject(Store);
  private layoutService = inject(LayoutService);
  private profileService = inject(ProfileService);

  ngOnInit(): void {
    this.initForm();
    this.fillForm();
  }

  public onClickLockOrUnlockForm($event: boolean): void {
    this.profileService.disableOrEnableForm(this.configurationForm, $event);
  }

  public onChangeDarkTheme(): void {
    const darkTheme: boolean = this.configurationForm.value.darkTheme;
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: darkTheme }));
    this.store.dispatch(new SetDarkMode({ darkMode: darkTheme }));
  }

  private initForm(): void {
    this.configurationForm = new FormGroup({
      darkTheme: new FormControl(),
    });

    this.profileService.disableOrEnableForm(this.configurationForm, true);
  }

  private fillForm(): void {
    const darkTheme: boolean = this.store.selectSnapshot(SessionStorageState.darkMode);
    this.configurationForm.setValue({ darkTheme });
  }
}
