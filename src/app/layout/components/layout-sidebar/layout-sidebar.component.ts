import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { UserAvatarComponent } from '@shared/components';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { IMenuFront, ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { AuthService, ConfigService, MenuFrontService, TranslateService, UserService } from '@shared/services';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { LayoutMenuComponent } from '../layout-menu';

@Component({
  selector: 'sctl-layout-sidebar',
  standalone: true,
  templateUrl: './layout-sidebar.component.html',
  imports: [
    NgClass,
    TitleCasePipe,
    TranslateModule,
    LayoutMenuComponent,
    UserAvatarComponent,
    MenuModule
  ]
})
export class LayoutSidebarComponent implements OnInit {
  public isFloating: boolean = true;
  public isUserAvatarEnabled: boolean = true;
  public actions: MenuItem[] = [];
  public canOpenMenu: boolean = false;

  public menu: IMenuFront[] = [];
  public el = inject(ElementRef);
  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private configService = inject(ConfigService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private menuFrontService = inject(MenuFrontService);

  public get user(): IUser {
    return this.userService.loggedUser();
  }

  constructor() {
    this.isFloating = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_FLOATING);
    this.isUserAvatarEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_USER_AVATAR_ENABLED);
  }

  ngOnInit(): void {
    this.translateService.stream('LAYOUT')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => this.setActions(res));

    this.menuFrontService.getUserMenuFront(this.user?._id)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: IMenuFront[]) => {
        this.menu = res ?? [];
        this.menu?.forEach((menuElement: IMenuFront, index: number) => {
          this.menu[index].items = this.menuFrontService.filterMenuItems(menuElement.items, this.user?.role?.name ?? '');
        });
      });
  }

  public clickMenu($event: any, menu: any): void {
    if (this.canOpenMenu) {
      menu.toggle($event);
      this.canOpenMenu = false;
    } else {
      menu.hide();
    }
  }

  public clickAvatar(menuContainer: any): void {
    this.canOpenMenu = true;
    menuContainer?.nativeElement?.click?.();
  }

  private setActions(literals: ITranslateLiterals): void {
    this.actions = [
      {
        label: literals['ACTIONS']['PROFILE'],
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/profile'])
      },
      {
        label: literals['ACTIONS']['LOGOUT'],
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
