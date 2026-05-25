import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { IErrorComponent } from '@layout/interfaces';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'sctl-error',
  standalone: true,
  templateUrl: './error.component.html',
  imports: [
    NgClass,
    TranslateModule,
    ButtonModule
  ],
})
export class ErrorComponent implements OnInit {

  public config: IErrorComponent = {};

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.translateService.stream('LAYOUT.ERROR')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.setConfig(res);
      });
  }

  public onClickButton(): void {
    if (!this.config?.buttonLink) {
      return;
    }
    this.router.navigate([this.config?.buttonLink]);
  }

  private setConfig(literals: ITranslateLiterals): void {
    this.config = {
      icon: 'pi-exclamation-circle',
      title: literals['TITLE'] ?? 'Error Occured',
      message: literals['MESSAGE'] ?? 'Requested resource is not available',
      image: '',
      buttonLabel: literals['BUTTON_LABEL'] ?? 'Go to Dashboard',
      buttonLink: '/'
    };
  }
}
