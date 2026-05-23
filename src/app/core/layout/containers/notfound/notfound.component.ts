import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { INotfoundComponent } from '@core/layout/interfaces';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'sctl-notfound',
  standalone: true,
  templateUrl: './notfound.component.html',
  imports: [
    TranslateModule,
    ButtonModule
  ]
})
export class NotfoundComponent implements OnInit {

  public config: INotfoundComponent = {};

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.translateService.stream('LAYOUT.NOTFOUND')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.setConfig(res);
      });
  }

  public showActions(): boolean {
    return this.config?.actions?.length > MAGIC_NUMBERS.N_0;
  }

  public onClickButton(link: string = ''): void {
    if (!this.config?.buttonLink && !link) {
      return;
    }

    this.router.navigate([link ? link : this.config?.buttonLink]);
  }

  private setConfig(literals: ITranslateLiterals): void {
    this.config = {
      title: literals['TITLE'] ?? 'Not Found',
      message: literals['MESSAGE'] ?? 'Requested resource is not available',
      buttonLabel: literals['BUTTON_LABEL'] ?? 'Go to Dashboard',
      buttonLink: '/',
      actions: []
    };
  }
}
