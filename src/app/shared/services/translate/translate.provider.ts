import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TranslateService } from './translate.service';
import { ITranslateConfig } from './translate.interface';

export function translateProvider(config: ITranslateConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    TranslateService,
    {
      provide: 'TRANSLATE_CONFIG',
      useValue: config
    }
  ]);
}
