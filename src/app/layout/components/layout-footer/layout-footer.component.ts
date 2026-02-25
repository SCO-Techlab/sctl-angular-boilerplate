import { NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ILayoutFooterComponent } from '@layout/interfaces';

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
