import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { SessionStorageState } from '@session-storage';
import { TranslateService } from '@shared/services';

export const HeadersInterceptor: HttpInterceptorFn = (req, next) => {

  const store = inject(Store);
  const translateService = inject(TranslateService);

  const token: string = store.selectSnapshot(SessionStorageState.accessToken) ?? '';
  const navigatorLang: string = translateService.currentLang ?? 'en';

  const headers: Record<string, string> = {
    ['X-LANG']: navigatorLang,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const clonedRequest = req.clone({
    setHeaders: headers
  });

  return next(clonedRequest);
};