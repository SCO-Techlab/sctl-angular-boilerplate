import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { ConfigInitializerFactory, ConfigService, ToastService, translateProvider } from '@sco-techlab/sctl-angular-core';
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
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigInitializerFactory,
      deps: [ConfigService],
      multi: true
    },
    translateProvider({
      defaultLang: 'en',
      availableLangs: ['en', 'es'],
      path: '/assets/i18n'
    }),
    ToastService
  ]
};
