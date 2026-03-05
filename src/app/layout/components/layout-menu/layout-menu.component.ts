import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { LayoutMenuItemComponent } from '../layout-menu-item';

@Component({
  selector: 'sctl-layout-menu',
  standalone: true,
  templateUrl: './layout-menu.component.html',
  imports: [
    CommonModule,
    LayoutMenuItemComponent,
    RouterModule
  ],
})
export class LayoutMenuComponent {
  public menu = input<MenuItem[]>([]);
}
