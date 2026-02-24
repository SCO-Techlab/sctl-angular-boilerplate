import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MAGIC_NUMBERS } from '../../../constants';
import { ILayoutNotfound } from '../../interfaces';
import { FloatingConfigurator } from '../floatingconfigurator';

@Component({
  selector: 'sctl-notfound',
  standalone: true,
  templateUrl: './notfound.html',
  imports: [
    RouterModule,
    FloatingConfigurator,
    ButtonModule
  ]
})
export class Notfound {

  @Input() config: ILayoutNotfound = {};

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.config.showConfigurator = this.config?.showConfigurator !== undefined ? this.config.showConfigurator : false;
    this.config.title = this.config?.title ?? 'Not Found';
    this.config.message = this.config?.message ?? 'Requested resource is not available.';
    this.config.actions = this.config?.actions ?? [];
    this.config.buttonLabel = this.config?.buttonLabel ?? 'Go to Dashboard';
    this.config.buttonLink = this.config?.buttonLink ?? '/';
  }

  showActions(): boolean {
    return this.config?.actions?.length > MAGIC_NUMBERS.N_0;
  }

  onClickButton(link: string = ''): void {
    if (!this.config?.buttonLink && !link) return;

    if (link) {
      this.router.navigate([link]);
      return;
    }

    this.router.navigate([this.config?.buttonLink]);
  }
}
