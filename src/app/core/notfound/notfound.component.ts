import { Component } from '@angular/core';
import { ILayoutNotfound, Notfound as NotfoundComponent } from '@/shared/layouts';

@Component({
  selector: 'app-notfound',
  standalone: true,
  templateUrl: './notfound.component.html',
  imports: [NotfoundComponent]
})
export class Notfound {
  public notfoundConfig: ILayoutNotfound = {
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
