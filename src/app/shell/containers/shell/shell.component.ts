import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ILayoutConfig } from '@layout/interfaces';
import { LayoutService } from '@layout/services';
import { SpinnerComponent, ToastComponent } from '@shared/components';
import { CONFIG_CONSTANTS, MAGIC_NUMBERS } from '@shared/constants';
import { TOAST_POSITION } from '@shared/enums';
import { ConfigService, ScreenService } from '@shared/services';
import { IShellComponent } from '../../interfaces';

@Component({
  selector: 'sctl-shell',
  standalone: true,
  templateUrl: './shell.component.html',
  imports: [
    RouterModule,
    SpinnerComponent,
    ToastComponent
  ]
})
export class ShellComponent implements OnInit {

  public config: IShellComponent = {};

  private layoutService = inject(LayoutService);
  private configService = inject(ConfigService);
  private screenService = inject(ScreenService);

  constructor() {
    this.setConfigTheme();
    this.screenService.setSize(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenService.setSize(event.target.innerWidth);
  }

  ngOnInit(): void {
    this.config = this.config ?? {};
    this.setConfigSpinner();
    this.setToastConfig();
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
    if (configTheme.preset) theme.preset = configTheme.preset;
    if (configTheme.primary) theme.primary = configTheme.primary;
    if (configTheme.surface) theme.surface = configTheme.surface;
    if (configTheme.darkTheme) theme.darkTheme = configTheme.darkTheme;
    if (configTheme.menuMode) theme.menuMode = configTheme.menuMode;

    this.layoutService.layoutConfig.set(theme);
  }

  private setConfigSpinner(): void {
    this.config.spinnerEnabled = this.config?.spinnerEnabled !== undefined
      ? this.config.spinnerEnabled
      : true;

    if (this.config?.spinnerEnabled !== true) {
      return;
    }

    this.config.spinnerConfig = this.config?.spinnerConfig
      ? this.config?.spinnerConfig
      : { loaderMode: true };

    this.config.spinnerConfig.loaderConfig = this.config?.spinnerConfig?.loaderConfig
      ? this.config?.spinnerConfig?.loaderConfig
      : { showLoader: true, width: MAGIC_NUMBERS.N_72, height: MAGIC_NUMBERS.N_72, borderWidth: MAGIC_NUMBERS.N_10 };
  }

  private setToastConfig(): void {
    this.config.toastEnabled = this.config?.toastEnabled !== undefined ? this.config.toastEnabled : true;
    this.config.toastConfig = this.config?.toastConfig ?? {};
    this.config.toastConfig.position = this.config.toastConfig?.position ?? TOAST_POSITION.TOP_RIGHT;
    this.config.toastConfig.toastLimit = this.config.toastConfig?.toastLimit ?? undefined;
  }
}
