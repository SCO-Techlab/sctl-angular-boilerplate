import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { environment } from '@environment';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import Aura from '@primeuix/themes/aura';
import { SessionStorageState } from '@session-storage';
import { AuthInitializer, ConfigInitializerFactory, TranslateProviderFactory } from '@shared/factories';
import { AdminGuard, AuthGuard } from '@shared/guards';
import { ErrorHandlerInterceptor, HeadersInterceptor } from '@shared/interceptors';
import { ConfigService, ScreenService, ToastService } from '@shared/services';
import { ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { RippleModule } from 'primeng/ripple';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation()
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        ErrorHandlerInterceptor,
        HeadersInterceptor
      ])
    ),
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
        [SessionStorageState],
        { developmentMode: !environment.production }
      ),
      NgxsStoragePluginModule.forRoot({ keys: ['sctlangularboilerplate'] }),
      RippleModule
    ),
    TranslateProviderFactory({
      defaultLang: 'en',
      availableLangs: ['en', 'es'],
      path: '/assets/i18n'
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigInitializerFactory,
      deps: [ConfigService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: AuthInitializer,
      multi: true
    },
    AuthGuard,
    AdminGuard,
    ScreenService,
    ToastService,
    ConfirmationService
  ]
};
