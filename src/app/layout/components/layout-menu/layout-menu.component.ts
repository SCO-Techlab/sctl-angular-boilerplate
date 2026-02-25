import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ILayoutMenuComponent } from '../../interfaces';
import { LayoutMenuItemComponent } from '../layout-menu-item/layout-menu-item.component';

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
  @Input() config: ILayoutMenuComponent;
}
