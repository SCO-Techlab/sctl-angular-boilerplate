import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IAccessComponent } from '@layout/interfaces';
import { ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { TranslateService } from '@shared/services';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'sctl-access',
  standalone: true,
  templateUrl: './access.component.html',
  imports: [
    NgClass,
    TranslateModule,
    ButtonModule
  ]
})
export class AccessComponent implements OnInit {

  public config: IAccessComponent = {};

  private destroyRef$ = inject(DestroyRef);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  ngOnInit(): void {
    this.translateService.stream('LAYOUT.ACCESS')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.setConfig(res);
      });
  }

  public onClickButton(): void {
    if (this.config?.buttonLink) {
      this.router.navigate([this.config.buttonLink]);
    }
  }

  private setConfig(literals: ITranslateLiterals): void {
    this.config = {
      icon: 'pi-lock',
      title: literals['TITLE'] ?? 'Access Denied',
      messages: [
        literals['MESSAGE_0'] ?? 'You do not have the necessary permisions to access this page',
        literals['MESSAGE_1'] ?? 'Please contact with admins'
      ],
      image: '',
      buttonLabel: literals['BUTTON_LABEL'] ?? 'Go to Dashboard',
      buttonLink: '/'
    };
  }
}
