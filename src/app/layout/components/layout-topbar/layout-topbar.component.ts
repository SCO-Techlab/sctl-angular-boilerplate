import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ILayoutTopbarComponent } from '@layout/interfaces';
import { Store } from '@ngxs/store';
import { SetDarkMode } from '@session-storage';
import { ThemeConfiguratorComponent } from '@shared/components';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfigService, LayoutService, ScreenService, TranslateService, UserService } from '@shared/services';
import { MenuItem } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'sctl-layout-topbar',
  standalone: true,
  templateUrl: './layout-topbar.component.html',
  imports: [
    CommonModule,
    StyleClassModule,
    TranslateModule,
    ThemeConfiguratorComponent
  ],
})
export class LayoutTopbarComponent implements OnInit {

  public config: ILayoutTopbarComponent;
  public items!: MenuItem[];
  public isSidebarEnabled = true;
  public isSwitchThemeEnabled = true;
  public isThemeConfiguratorEnabled = true;
  public areActionsEnabled = true;

  public layoutService = inject(LayoutService);
  public screenService = inject(ScreenService);
  private destroyRef$ = inject(DestroyRef);
  private configService = inject(ConfigService);
  private router = inject(Router);
  private store = inject(Store);
  private translateService = inject(TranslateService);
  private userService = inject(UserService);

  constructor() {
    this.isSidebarEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_ENABLED);
    this.isSwitchThemeEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_SWITCH_THEME_ENABLED);
    this.isThemeConfiguratorEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_THEME_CONFIGURATOR_ENABLED);
    this.areActionsEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_ACTIONS_ENABLED);
  }

  ngOnInit(): void {
    this.translateService.stream('LAYOUT.TOPBAR')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.setConfig(res);
      });
  }

  public toggleDarkMode(): void {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    this.store.dispatch(new SetDarkMode({ darkMode: this.layoutService.isDarkTheme() }));
  }

  public onClickLogo(): void {
    if (this.config?.logoRedirect) {
      this.router.navigate([this.config?.logoRedirect]);
    }
  }

  private userLogOut(): void {
    this.userService.logout({ reason: 'signout' });
  }

  private setConfig(literals: ITranslateLiterals): void {
    this.config = {
      menuButtonCssClass: 'me-2 mt-2',
      menuButtonIconSize: '1.75rem',
      logoRedirect: '/',
      logoUrl: 'assets/images/logo.png',
      logoText: this.configService.get(CONFIG_CONSTANTS.LAYOUT.APP_NAME),
      logoCssClass: 'w-20',
      actions: [
        {
          label: literals['ACTIONS']['PROFILE'],
          icon: 'pi pi-user',
          command: () => this.router.navigate(['/profile'])
        },
        {
          label: literals['ACTIONS']['LOGOUT'],
          icon: 'pi pi-sign-out',
          command: () => this.userLogOut()
        }
      ],
      switchThemeDarkModeLabel: literals['SWITCH_THEME_DARK_MODE'],
      switchThemeLightModeLabel: literals['SWITCH_THEME_LIGHT_MODE']
    };
  }
}
