import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { IAccessComponent } from './access.interface';
import { FloatingConfigurator } from '@layout/components';

@Component({
  selector: 'sctl-access',
  standalone: true,
  templateUrl: './access.component.html',
  imports: [
    ButtonModule,
    RouterModule,
    RippleModule,
    FloatingConfigurator
  ],
})
export class AccessComponent implements OnInit {

  public config: IAccessComponent = {};

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.checkDefaultConfig();
  }

  onClickButton(): void {
    if (!this.config?.buttonLink) return;
    this.router.navigate([this.config?.buttonLink]);
  }

  private checkDefaultConfig(): void {
    this.config.showConfigurator = this.config?.showConfigurator !== undefined ? this.config.showConfigurator : false;
    this.config.showIcon = this.config?.showIcon !== undefined ? this.config.showIcon : true;
    this.config.icon = this.config?.icon ?? 'pi-lock';
    this.config.title = this.config?.title ?? 'Access Denied';
    this.config.message = this.config?.message ?? 'You do not have the necessary permisions. Please contact admins.';
    this.config.showImage = this.config?.showImage !== undefined ? this.config.showImage : true;
    this.config.image = this.config?.image ?? 'https://primefaces.org/cdn/templates/sakai/auth/asset-access.svg';
    this.config.buttonLabel = this.config?.buttonLabel ?? 'Go to Dashboard';
    this.config.buttonLink = this.config?.buttonLink ?? '/';
  }
}
