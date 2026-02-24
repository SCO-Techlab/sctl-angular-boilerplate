import { NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ILayoutFooter } from '../../interfaces';

@Component({
  standalone: true,
  selector: 'sctl-footer',
  templateUrl: './footer.html',
  imports: [
    NgTemplateOutlet
  ]
})
export class Footer {
  @Input() config: ILayoutFooter;
}
