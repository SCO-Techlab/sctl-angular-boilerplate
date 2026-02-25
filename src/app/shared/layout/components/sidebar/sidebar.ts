import { NgClass } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';
import { CONFIG_CONSTANTS, ConfigService } from '../../../services';
import { ILayoutSidebar } from '../../interfaces';
import { Menu } from '../menu/menu';

@Component({
  selector: 'sctl-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  imports: [
    NgClass,
    Menu
  ]
})
export class Sidebar {

  @Input() config: ILayoutSidebar;

  public isFloating = true;

  constructor(
    public el: ElementRef,
    public configService: ConfigService
  ) {
    this.isFloating = this.configService.get(CONFIG_CONSTANTS.LAYOUT.FLOATING_SIDEBAR);
  }
}
