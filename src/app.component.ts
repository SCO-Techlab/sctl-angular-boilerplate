import { Component } from '@angular/core';
import { ShellComponent } from '@shell/containers';

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
