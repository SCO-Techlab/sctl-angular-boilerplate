import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ILayoutError } from '../../interfaces';
import { FloatingConfigurator } from '../floatingconfigurator';

@Component({
  selector: 'sctl-error',
  standalone: true,
  templateUrl: './error.html',
  imports:
    [
      ButtonModule,
      RippleModule,
      RouterModule,
      FloatingConfigurator
    ],
})
export class Error implements OnInit {

  @Input() config: ILayoutError = {};

  constructor(private router: Router) { }

  ngOnInit(): void {
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

  onClickButton(): void {
    if (!this.config?.buttonLink) return;
    this.router.navigate([this.config?.buttonLink]);
  }
}
