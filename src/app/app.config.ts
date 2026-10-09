import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';

import {routes} from './app.routes';
import {authInterceptor} from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      })
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};

