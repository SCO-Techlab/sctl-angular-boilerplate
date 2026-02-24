import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslatePipe } from './translate.pipe';
import { TranslateDirective } from './translate.directive';
import { translateProvider } from './translate.provider';
import { ITranslateConfig } from './translate.interface';

@NgModule({
  imports: [TranslatePipe, TranslateDirective],
  exports: [TranslatePipe, TranslateDirective],
})
export class TranslateModule {
  static forRoot(config: ITranslateConfig): ModuleWithProviders<TranslateModule> {
    return {
      ngModule: TranslateModule,
      providers: [
        translateProvider(config)
      ]
    };
  }
}