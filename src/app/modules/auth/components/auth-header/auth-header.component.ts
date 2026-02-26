import { NgClass } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IAuthHeaderComponent } from '@modules/auth/interfaces';

@Component({
  selector: 'sctl-auth-header',
  standalone: true,
  templateUrl: './auth-header.component.html',
  imports: [
    NgClass
  ]
})
export class AuthHeaderComponent implements OnInit {

  @Input() config: IAuthHeaderComponent;

  private router = inject(Router);

  ngOnInit() {
    this.config = this.config ?? {};
    this.config.containerCssClass = this.config.containerCssClass ?? 'text-center mb-8';
  }

  onClickLogo(): void {
    if (!this.config?.logoRedirect) {
      return;
    }

    this.router.navigate([this.config.logoRedirect]);
  }
}
