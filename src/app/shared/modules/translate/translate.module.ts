import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateDirective } from '@shared/directives';
import { TranslateProviderFactory } from '@shared/factories';
import { ITranslateConfig } from '@shared/interfaces';
import { TranslatePipe } from '@shared/pipes';

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