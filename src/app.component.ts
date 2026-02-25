import { Shell } from '@/shared/layout';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Shell],
  template: `<sctl-shell></sctl-shell>`
})
export class AppComponent {
}
