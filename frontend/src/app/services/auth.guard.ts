import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authStatus$.pipe(
    // Wait until status is NOT null (i.e., the HTTP check has completed)
    filter(status => status !== null),
    take(1),
    map(status => {
      if (status!.authenticated) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};
