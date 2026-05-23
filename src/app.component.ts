import { Component, DestroyRef, HostListener, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { SpinnerComponent, ToastComponent } from '@core/components';
import { SessionStorageState } from '@core/session-storage';
import { CONFIG_CONSTANTS, MAGIC_NUMBERS } from '@core/shared/constants';
import { TOAST_POSITION } from '@core/shared/enums';
import { ILayoutConfig, ISpinnerComponent, IToastComponent } from '@core/shared/interfaces';
import { ConfigService, LayoutService, ScreenService, SpinnerService, TranslateService } from '@core/shared/services';
import { Store } from '@ngxs/store';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [
    RouterModule,
    SpinnerComponent,
    ToastComponent,
    ConfirmDialogModule
  ]
})
export class AppComponent implements OnInit {

  public toastConfig: IToastComponent;
  public spinnerConfig: ISpinnerComponent;
  public contentReady: boolean = false;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly layoutService = inject(LayoutService);
  private readonly configService = inject(ConfigService);
  private readonly screenService = inject(ScreenService);
  private readonly spinnerService = inject(SpinnerService);
  private readonly translateService = inject(TranslateService);
  private readonly store = inject(Store);

  constructor() {
    this.setConfigTheme();
    this.spinnerConfig = this.setConfigSpinner();
    this.toastConfig = this.setToastConfig();
    this.screenService.setSize(window.innerWidth);
    this.spinnerService.show();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.screenService.setSize(event.target.innerWidth);
  }

  ngOnInit(): void {
    this.translateService.stream('')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(() => {
        if (this.spinnerService.isShowing) {
          this.spinnerService.hide();
        }

        if (!this.contentReady) {
          this.contentReady = true;
        }
      });
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
