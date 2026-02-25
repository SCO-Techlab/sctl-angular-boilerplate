import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ITranslateConfig } from '../interfaces';
import { TranslateService } from '../services';

export function TranslateProviderFactory(config: ITranslateConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    TranslateService,
    {
      provide: 'TRANSLATE_CONFIG',
      useValue: config
    }
  ]);
}
