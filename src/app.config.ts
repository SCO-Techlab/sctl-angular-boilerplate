import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { SessionStorageState } from '@core/session-storage';
import { ScreenService, ToastService } from '@core/shared/services';
import { environment } from '@environment';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import Aura from '@primeuix/themes/aura';
import { ConfigInitializerFactory, TranslateProviderFactory } from '@shared/factories';
import { AdminGuard, AuthGuard } from '@shared/guards';
import { ErrorHandlerInterceptor, HeadersInterceptor } from '@shared/interceptors';
import { ConfigService } from '@shared/services';
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
    AuthGuard,
    AdminGuard,
    ScreenService,
    ToastService,
    ConfirmationService
  ]
};
