import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { ConfigInitializerFactory, ConfigService, translateProvider } from '@/shared/services';
import { ToastService } from '@/shared/components';

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
