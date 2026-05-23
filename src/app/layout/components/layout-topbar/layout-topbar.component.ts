import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CONFIG_CONSTANTS } from '@core/shared/constants';
import { ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { ConfigService, TranslateService } from '@core/shared/services';
import { ThemeConfiguratorComponent, UserAvatarComponent } from '@shared/components';
import { IUser } from '@shared/interfaces';
import { AuthService, LayoutService, UserService } from '@shared/services';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'sctl-layout-topbar',
  standalone: true,
  templateUrl: './layout-topbar.component.html',
  imports: [
    CommonModule,
    StyleClassModule,
    TranslateModule,
    ThemeConfiguratorComponent,
    UserAvatarComponent,
    MenuModule
  ],
})
export class LayoutTopbarComponent implements OnInit {

  public actions!: MenuItem[];
  public isSidebarEnabled = true;
  public isThemeConfiguratorEnabled = true;
  public areActionsEnabled = true;
  public isUserAvatarEnabled = true;
  public appName: string = '';
  public user: IUser;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly layoutService = inject(LayoutService);
  private readonly configService = inject(ConfigService);
  private readonly translateService = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  constructor() {
    this.isSidebarEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_ENABLED);
    this.isThemeConfiguratorEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_THEME_CONFIGURATOR_ENABLED);
    this.areActionsEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_ACTIONS_ENABLED);
    this.isUserAvatarEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.TOPBAR_USER_AVATAR_ENABLED);
    this.appName = this.configService.get(CONFIG_CONSTANTS.APP_NAME) ?? '';
    this.user = this.userService.loggedUser();
  }

  ngOnInit(): void {
    this.translateService.stream('LAYOUT.ACTIONS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => this.setActions(res));
  }

  public onClickLogo(): void {
    this.router.navigate(['/']);
  }

  public onMenuButtonClick(): void {
    this.layoutService.onMenuToggle();
  }

  private setActions(literals: ITranslateLiterals): void {
    this.actions = [
      {
        label: literals['PROFILE'],
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/profile'])
      },
      {
        label: literals['LOGOUT'],
        icon: 'pi pi-sign-out',
        command: () => {
          this.authService.logOut()
            .pipe(takeUntilDestroyed(this.destroyRef$))
            .subscribe(() => this.userService.logout({ reason: 'signout' }));
        }
      }
    ];
  }
}
