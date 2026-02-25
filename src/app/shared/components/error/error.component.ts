import { FloatingConfigurator } from '@/layout/components';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { IErrorComponent } from './error.interface';

@Component({
  selector: 'sctl-error',
  standalone: true,
  templateUrl: './error.component.html',
  imports:
    [
      ButtonModule,
      RippleModule,
      RouterModule,
      FloatingConfigurator
    ],
})
export class ErrorComponent implements OnInit {

  public config: IErrorComponent = {};

  private router = inject(Router);

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
    this.config.icon = this.config?.icon ?? 'pi-exclamation-circle';
    this.config.title = this.config?.title ?? 'Error Occured';
    this.config.message = this.config?.message ?? 'Requested resource is not available.';
    this.config.showImage = this.config?.showImage !== undefined ? this.config.showImage : true;
    this.config.image = this.config?.image ?? 'https://primefaces.org/cdn/templates/sakai/auth/asset-error.svg';
    this.config.buttonLabel = this.config?.buttonLabel ?? 'Go to Dashboard';
    this.config.buttonLink = this.config?.buttonLink ?? '/';
  }
}
