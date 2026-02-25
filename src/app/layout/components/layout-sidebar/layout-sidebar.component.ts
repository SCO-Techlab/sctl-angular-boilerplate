import { NgClass } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';
import { ILayoutSidebarComponent } from '@layout/interfaces';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { ConfigService } from '@shared/services';
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

  @Input() config: ILayoutSidebarComponent;

  public isFloating = true;

  constructor(
    public el: ElementRef,
    public configService: ConfigService
  ) {
    this.isFloating = this.configService.get(CONFIG_CONSTANTS.LAYOUT.FLOATING_SIDEBAR);
  }
}
