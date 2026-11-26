import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { AuthService } from './auth.service';

/** Allows authenticated users; attempts a silent refresh first (e.g. after a page reload). */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return auth.refresh().pipe(map((token) => (token ? true : router.createUrlTree(['/login']))));
};

/** Restricts a route to administrators. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const check = () => (auth.isAdmin() ? true : router.createUrlTree(['/library']));
  return auth.isAuthenticated() ? of(check()) : auth.refresh().pipe(map(check));
};
