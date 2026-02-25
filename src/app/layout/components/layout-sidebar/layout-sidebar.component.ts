import { NgClass } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';
import { CONFIG_CONSTANTS, ConfigService } from '../../../shared/services';
import { ILayoutSidebarComponent } from '../../interfaces';
import { LayoutMenuComponent } from '../layout-menu/layout-menu.component';

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
