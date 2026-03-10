import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { UserAvatarComponent } from '@shared/components';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { ITranslateLiterals, IUser } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfigService, TranslateService, UserService } from '@shared/services';
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

  public menu = input<MenuItem[]>([]);

  public isFloating: boolean = true;
  public isUserAvatarEnabled: boolean = true;
  public actions: MenuItem[] = [];

  public el = inject(ElementRef);
  private destroyRef$ = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private configService = inject(ConfigService);
  private userService = inject(UserService);
  private router = inject(Router);

  public get user(): IUser {
    return this.userService.loggedUser();
  }

  constructor() {
    this.isFloating = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_FLOATING);
    this.isUserAvatarEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_USER_AVATAR_ENABLED);
  }

  ngOnInit(): void {
    this.translateService.stream('LAYOUT.ACTIONS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => this.setActions(res));
  }

  public onClickAvatar(): void {
    console.log('clicked avatar');
  }

  private setActions(literals: ITranslateLiterals): void {
    this.actions = [
      {
        label: this.user?.personalName ?? this.user?.userName ?? this.user?.email,
        items: [
          {
            label: literals['PROFILE'],
            icon: 'pi pi-refresh',
            command: () => this.router.navigate(['/profile'])
          },
          {
            label: literals['LOGOUT'],
            icon: 'pi pi-upload',
            command: () => this.userService.logout({ reason: 'signout' })
          }
        ]
      }
    ];
  }
}
