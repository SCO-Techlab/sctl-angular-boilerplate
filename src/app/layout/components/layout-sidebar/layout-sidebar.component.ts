import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, input } from '@angular/core';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { ConfigService } from '@shared/services';
import { MenuItem } from 'primeng/api';
import { LayoutMenuComponent } from '../layout-menu';

@Component({
  selector: 'sctl-layout-sidebar',
  standalone: true,
  templateUrl: './layout-sidebar.component.html',
  imports: [
    NgClass,
    LayoutMenuComponent
  ]
})
export class LayoutSidebarComponent {

  public menu = input<MenuItem[]>([
    {
      label: 'Home',
      visible: true,
      items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'], visible: true }]
    },
  ]);

  public isFloating: boolean = true;

  public el = inject(ElementRef);
  private configService = inject(ConfigService);

  constructor() {
    this.isFloating = this.configService.get(CONFIG_CONSTANTS.LAYOUT.FLOATING_SIDEBAR);
  }
}
