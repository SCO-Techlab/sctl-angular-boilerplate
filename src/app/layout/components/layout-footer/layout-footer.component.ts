import { ILayoutFooterComponent } from '@/layout/interfaces';
import { NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'sctl-layout-footer',
  templateUrl: './layout-footer.component.html',
  imports: [
    NgTemplateOutlet
  ]
})
export class LayoutFooterComponent {
  @Input() config: ILayoutFooterComponent;
}
