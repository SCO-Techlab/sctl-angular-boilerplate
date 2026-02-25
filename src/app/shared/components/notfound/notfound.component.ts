import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { INotfoundComponent } from './notfound.interface';
import { FloatingConfigurator } from '@layout/components';
import { MAGIC_NUMBERS } from '@shared/constants';

@Component({
  selector: 'sctl-notfound',
  standalone: true,
  templateUrl: './notfound.component.html',
  imports: [
    RouterModule,
    FloatingConfigurator,
    ButtonModule
  ]
})
export class NotfoundComponent {
  public config: INotfoundComponent = {};

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.config = {
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

    this.checkDefaultConfig();
  }

  showActions(): boolean {
    return this.config?.actions?.length > MAGIC_NUMBERS.N_0;
  }

  onClickButton(link: string = ''): void {
    if (!this.config?.buttonLink && !link) {
      return;
    }

    if (link) {
      this.router.navigate([link]);
      return;
    }

    this.router.navigate([this.config?.buttonLink]);
  }

  private checkDefaultConfig(): void {
    this.config.showConfigurator = this.config?.showConfigurator !== undefined ? this.config.showConfigurator : false;
    this.config.title = this.config?.title ?? 'Not Found';
    this.config.message = this.config?.message ?? 'Requested resource is not available.';
    this.config.actions = this.config?.actions ?? [];
    this.config.buttonLabel = this.config?.buttonLabel ?? 'Go to Dashboard';
    this.config.buttonLink = this.config?.buttonLink ?? '/';
  }
}
