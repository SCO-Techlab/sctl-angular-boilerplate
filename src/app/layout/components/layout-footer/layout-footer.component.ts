import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CONFIG_CONSTANTS } from '@shared/constants';
import { ITranslateLiterals } from '@shared/interfaces';
import { TranslateModule } from '@shared/modules';
import { ConfigService, TranslateService } from '@shared/services';

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

  private destroyRef$ = inject(DestroyRef);
  private configService = inject(ConfigService);
  private translateService = inject(TranslateService);

  constructor() {
    this.footerLinkText = this.configService.get(CONFIG_CONSTANTS.LAYOUT.APP_NAME);
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
