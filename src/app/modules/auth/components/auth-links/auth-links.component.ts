import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { IAuthLinksComponent } from '@modules/auth/interfaces';

@Component({
  selector: 'sctl-auth-links',
  standalone: true,
  templateUrl: './auth-links.component.html'
})
export class AuthLinksComponent {
  public config = input<IAuthLinksComponent>({
    links: []
  });

  private router = inject(Router);

  public showLinks(): boolean {
    return this.config()?.links?.length > MAGIC_NUMBERS.N_0;
  }

  public onClickLink(url: string): void {
    if (url) {
      this.router.navigate([url]);
    }
  }
}
