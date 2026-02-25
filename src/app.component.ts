import { Shell } from '@/shell';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<sctl-shell></sctl-shell>`,
  imports: [
    Shell
  ]
})
export class AppComponent {
}
