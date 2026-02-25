import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ILayoutMenu } from '../../interfaces';
import { Menuitem } from '../menuitem/menuitem';

@Component({
  selector: 'sctl-menu',
  standalone: true,
  templateUrl: './menu.html',
  imports: [
    CommonModule,
    Menuitem,
    RouterModule
  ],
})
export class Menu {
  @Input() config: ILayoutMenu;
}
