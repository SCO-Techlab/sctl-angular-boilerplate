import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ILayoutTopbarComponent } from '@layout/interfaces';
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
export class LayoutTopbarComponent {

  @Input() config: ILayoutTopbarComponent;

  items!: MenuItem[];

  public isSidebarEnabled = true;
  public isSwitchThemeEnabled = true;
  public isThemeConfiguratorEnabled = true;
  public areActionsEnabled = true;

  constructor(
    public layoutService: LayoutService,
    public configService: ConfigService,
    public screenService: ScreenService,
    private router: Router
  ) {
    this.isSidebarEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_ENABLED);
    this.isSwitchThemeEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_SWITCH_THEME_ENABLED);
    this.isThemeConfiguratorEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_THEME_CONFIGURATOR_ENABLED);
    this.areActionsEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_ACTIONS_ENABLED);
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

  onClickLogo() {
    if (this.config?.logoRedirect) {
      this.router.navigate([this.config?.logoRedirect]);
    }
  }
}
