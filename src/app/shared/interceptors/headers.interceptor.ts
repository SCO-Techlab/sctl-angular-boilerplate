import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStorageState } from '@core/session-storage';
import { TranslateService } from '@core/shared/services';
import { environment } from '@environment';
import { Store } from '@ngxs/store';
import { SelectTenantService } from '@shared/services';

export const HeadersInterceptor: HttpInterceptorFn = (req, next) => {

  const store = inject(Store);
  const translateService = inject(TranslateService);
  const selectTenantService = inject(SelectTenantService);

  const navigatorLang: string = translateService.currentLang ?? 'en';
  const headers: Record<string, string> = {
    ['X-LANG']: navigatorLang,
  };

  if (environment.multitenancyEnabled) {
    headers['X-TENANT'] = selectTenantService.selectedTenant ?? '';
  }

  const token: string = store.selectSnapshot(SessionStorageState.accessToken) ?? '';
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const clonedRequest = req.clone({
    setHeaders: headers
  });

  return next(clonedRequest);
};