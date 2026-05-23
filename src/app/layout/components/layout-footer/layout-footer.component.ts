import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { TranslateService } from '@core/shared/services';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { ConfigService } from '@shared/services';

@Component({
  standalone: true,
  selector: 'sctl-layout-footer',
  templateUrl: './layout-footer.component.html',
  imports: [
    TranslateModule
  ]
})
export class LayoutFooterComponent implements OnInit {
  public footerText: string = 'Angular Boilerplate by';
  public footerLink: string = '';
  public footerLinkText: string = '';

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly configService = inject(ConfigService);
  private readonly translateService = inject(TranslateService);

  constructor() {
    this.footerLinkText = this.configService.get(CONFIG_CONSTANTS.APP_NAME);
  }

  ngOnInit(): void {
    this.translateService.stream('LAYOUT.FOOTER')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.footerText = res['TEXT'];
        this.footerLink = 'https://sco-techlab.com';
      });
  }
}
