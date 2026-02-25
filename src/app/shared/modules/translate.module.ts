import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateDirective } from '../directives';
import { TranslateProviderFactory } from '../factories';
import { ITranslateConfig } from '../interfaces';
import { TranslatePipe } from '../pipes';

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