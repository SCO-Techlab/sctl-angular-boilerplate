import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutMenuItemComponent } from '../layout-menu-item';

@Component({
  selector: 'sctl-layout-menu',
  standalone: true,
  templateUrl: './layout-menu.component.html',
  imports: [
    CommonModule,
    LayoutMenuItemComponent
  ],
})
export class LayoutMenuComponent {
  public menu = input<MenuItem[]>([]);
}
