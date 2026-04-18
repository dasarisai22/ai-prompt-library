import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

/**
 * App-wide providers for the standalone Angular application.
 * - provideRouter: enables client-side routing
 * - provideHttpClient: enables HTTP calls to Django backend
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ],
};
