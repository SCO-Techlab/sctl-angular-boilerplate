import { Component } from '@angular/core';
import { SakaiShell } from '@sco-techlab/sctl-angular-core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SakaiShell],
  template: `<sctl-sakai-shell></sctl-sakai-shell>`
})
export class AppComponent {

}
