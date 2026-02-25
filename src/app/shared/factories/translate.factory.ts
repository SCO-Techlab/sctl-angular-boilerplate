import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ITranslateConfig } from '@shared/interfaces';
import { TranslateService } from '@shared/services';

export function TranslateProviderFactory(config: ITranslateConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    TranslateService,
    {
      provide: 'TRANSLATE_CONFIG',
      useValue: config
    }
  ]);
}
