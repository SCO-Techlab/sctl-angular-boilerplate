import { ShellComponent } from '@/shell';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<sctl-shell></sctl-shell>`,
  imports: [
    ShellComponent
  ]
})
export class AppComponent {
}
