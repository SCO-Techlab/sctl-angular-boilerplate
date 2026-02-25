import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TranslateService } from '../services/translate/translate.service';
import { ITranslateConfig } from '../interfaces/translate.interface';

export function TranslateProviderFactory(config: ITranslateConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    TranslateService,
    {
      provide: 'TRANSLATE_CONFIG',
      useValue: config
    }
  ]);
}
