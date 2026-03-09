import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, inject, input, OnInit } from '@angular/core';
import { UserAvatarComponent } from '@shared/components';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { IUser } from '@shared/interfaces';
import { ConfigService, UserService } from '@shared/services';
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
    LayoutMenuComponent,
    UserAvatarComponent,
    MenuModule
  ]
})
export class LayoutSidebarComponent implements OnInit {

  public menu = input<MenuItem[]>([]);

  public isFloating: boolean = true;
  public isUserAvatarEnabled: boolean = true;
  public items: MenuItem[] = [];

  public el = inject(ElementRef);
  private configService = inject(ConfigService);
  private userService = inject(UserService);

  public get user(): IUser {
    return this.userService.loggedUser();
  }

  constructor() {
    this.isFloating = this.configService.get(CONFIG_CONSTANTS.LAYOUT.FLOATING_SIDEBAR);
    this.isUserAvatarEnabled = this.configService.get(CONFIG_CONSTANTS.LAYOUT.SIDEBAR_USER_AVATAR_ENABLED);
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Options',
        items: [
          {
            label: 'Refresh',
            icon: 'pi pi-refresh'
          },
          {
            label: 'Export',
            icon: 'pi pi-upload'
          }
        ]
      }
    ];
  }

  public onClickAvatar(): void {
    console.log('clicked avatar');
  }
}
