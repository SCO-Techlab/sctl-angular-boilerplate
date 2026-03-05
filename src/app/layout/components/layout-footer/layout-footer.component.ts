import { Component, inject } from '@angular/core';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { ConfigService } from '@shared/services';

@Component({
  standalone: true,
  selector: 'sctl-layout-footer',
  templateUrl: './layout-footer.component.html',
  imports: []
})
export class LayoutFooterComponent {
  public footerText: string = 'Angular Boilerplate by';
  public footerLink: string = 'https://sco-techlab.com';
  public footerLinkText: string = '';

  private configService = inject(ConfigService);

  constructor() {
    this.footerLinkText = this.configService.get(CONFIG_CONSTANTS.LAYOUT.APP_NAME);
  }
}
