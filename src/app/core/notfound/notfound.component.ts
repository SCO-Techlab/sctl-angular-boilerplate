import { Component } from '@angular/core';
import { ISakaiLayoutNotfound, SakaiNotfound } from '@sco-techlab/sctl-angular-core';

@Component({
  selector: 'app-notfound',
  standalone: true,
  templateUrl: './notfound.component.html',
  imports: [SakaiNotfound]
})
export class Notfound {
  public notfoundConfig: ISakaiLayoutNotfound = {
    showConfigurator: true,
    title: 'Not Found',
    message: 'Requested resource is not available.',
    buttonLabel: 'Go to Dashboard',
    buttonLink: '/',
    actions: [
      {
        icon: 'pi-table',
        title: 'Example',
        subTitle: 'Sub title example',
        link: '/'
      }
    ]
  };
}
