import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateDirective } from '@core/shared/directives';
import { TranslateProviderFactory } from '@core/shared/factories';
import { ITranslateConfig } from '@core/shared/interfaces';
import { TranslatePipe } from '@core/shared/pipes';

@NgModule({
  imports: [
    TranslatePipe,
    TranslateDirective
  ],
  exports: [
    TranslatePipe,
    TranslateDirective
  ],
})
export class TranslateModule {
  static forRoot(config: ITranslateConfig): ModuleWithProviders<TranslateModule> {
    return {
      ngModule: TranslateModule,
      providers: [
        TranslateProviderFactory(config)
      ]
    };
  }
}