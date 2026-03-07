import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { SessionStorageState } from '@session-storage';
import { SpinnerComponent, ToastComponent } from '@shared/components';
import { CONFIG_CONSTANTS, MAGIC_NUMBERS } from '@shared/constants';
import { TOAST_POSITION } from '@shared/enums';
import { ILayoutConfig, ISpinnerComponent, IToastComponent } from '@shared/interfaces';
import { ConfigService, LayoutService, ScreenService } from '@shared/services';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [
    RouterModule,
    SpinnerComponent,
    ToastComponent
  ]
})
export class AppComponent implements OnInit {

  public toastConfig: IToastComponent;
  public spinnerConfig: ISpinnerComponent;

  private layoutService = inject(LayoutService);
  private configService = inject(ConfigService);
  private screenService = inject(ScreenService);
  private store = inject(Store);

  constructor() {
    this.setConfigTheme();
    this.screenService.setSize(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenService.setSize(event.target.innerWidth);
  }

  ngOnInit(): void {
    this.spinnerConfig = this.setConfigSpinner();
    this.toastConfig = this.setToastConfig();
  }

  private setConfigTheme(): void {
    const configTheme: Partial<ILayoutConfig> = {
      preset: this.configService.get(CONFIG_CONSTANTS.LAYOUT.THEME_PRESET) ?? undefined,
      primary: this.configService.get(CONFIG_CONSTANTS.LAYOUT.THEME_PRIMARY) ?? undefined,
      surface: this.configService.get(CONFIG_CONSTANTS.LAYOUT.THEME_SURFACE) ?? undefined,
      darkTheme: this.configService.get(CONFIG_CONSTANTS.LAYOUT.THEME_DARK_THEME) ?? undefined,
      menuMode: this.configService.get(CONFIG_CONSTANTS.LAYOUT.THEME_MENU_MODE) ?? undefined
    };

    const theme = { ...this.layoutService.layoutConfig() };
    theme.preset = configTheme.preset ?? theme.preset;
    theme.primary = configTheme.primary ?? theme.primary;
    theme.surface = configTheme.surface ?? theme.surface;
    theme.darkTheme = configTheme.darkTheme ?? theme.darkTheme;
    theme.menuMode = configTheme.menuMode ?? theme.menuMode;

    if (this.store.selectSnapshot(SessionStorageState.darkMode) !== undefined) {
      theme.darkTheme = this.store.selectSnapshot(SessionStorageState.darkMode);
    }

    if (this.store.selectSnapshot(SessionStorageState.staticMenu) !== undefined) {
      theme.menuMode = this.store.selectSnapshot(SessionStorageState.staticMenu) 
        ? 'static' 
        : 'overlay';
    }

    this.layoutService.layoutConfig.set(theme);
    this.layoutService.toggleDarkMode(theme);
  }

  private setConfigSpinner(): ISpinnerComponent {
    return {
      loaderMode: true,
      loaderConfig: {
        showLoader: true,
        width: MAGIC_NUMBERS.N_72,
        height: MAGIC_NUMBERS.N_72,
        borderWidth: MAGIC_NUMBERS.N_10
      }
    };
  }

  private setToastConfig(): IToastComponent {
    return {
      position: TOAST_POSITION.TOP_RIGHT,
      toastLimit: undefined
    };
  }
}
