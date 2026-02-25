import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { environment } from '@environment';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { PersistStorageState } from '@persist-storage/persist-storage.state';
import Aura from '@primeuix/themes/aura';
import { ConfigInitializerFactory, TranslateProviderFactory } from '@shared/factories';
import { ConfigService, ToastService } from '@shared/services';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation()
    ),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    }),
    importProvidersFrom(
      NgxsModule.forRoot(
        [PersistStorageState],
        { developmentMode: !environment.production }
      ),
      NgxsStoragePluginModule.forRoot({ keys: ['persiststorage'] })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigInitializerFactory,
      deps: [ConfigService],
      multi: true
    },
    TranslateProviderFactory({
      defaultLang: 'en',
      availableLangs: ['en', 'es'],
      path: '/assets/i18n'
    }),
    ToastService
  ]
};
