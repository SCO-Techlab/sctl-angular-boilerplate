import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ILayoutTopbarComponent } from '@layout/interfaces';
import { Store } from '@ngxs/store';
import { SetDarkMode, SetToken } from '@session-storage';
import { ThemeConfiguratorComponent } from '@shared/components';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { ConfigService, LayoutService, ScreenService } from '@shared/services';
import { MenuItem } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'sctl-layout-topbar',
  standalone: true,
  templateUrl: './layout-topbar.component.html',
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
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
  private configService = inject(ConfigService);
  private router = inject(Router);
  private store = inject(Store);

  constructor() {
    this.isSidebarEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_ENABLED);
    this.isSwitchThemeEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_SWITCH_THEME_ENABLED);
    this.isThemeConfiguratorEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_THEME_CONFIGURATOR_ENABLED);
    this.areActionsEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_ACTIONS_ENABLED);
  }

  ngOnInit(): void {
    this.config = {
      menuButtonCssClass: 'me-2 mt-2',
      menuButtonIconSize: '1.75rem',
      logoRedirect: '/',
      logoUrl: 'assets/images/logo.png',
      logoText: this.configService.get(CONFIG_CONSTANTS.LAYOUT.APP_NAME),
      logoCssClass: 'w-20',
      actions: [
        {
          label: 'Profile',
          icon: 'pi pi-user',
          command: (action) => this.router.navigate(['/profile'])
        },
        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          command: (action) => this.userLogOut()
        }
      ],
      switchThemeDarkModeLabel: 'Dark mode',
      switchThemeLightModeLabel: 'Light mode'
    };
  }

  toggleDarkMode(): void {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    this.store.dispatch(new SetDarkMode({ darkMode: this.layoutService.isDarkTheme() }));
  }

  onClickLogo(): void {
    if (this.config?.logoRedirect) {
      this.router.navigate([this.config?.logoRedirect]);
    }
  }

  private userLogOut(): void {
    this.store.dispatch(new SetToken({ token: undefined }));
    this.router.navigate(
      ['/auth/login'],
      {
        queryParams: {
          reason: 'signout'
        }
      }
    );
  }
}
