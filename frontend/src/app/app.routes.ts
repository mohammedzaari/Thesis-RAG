import { Routes } from '@angular/router';
import { adminGuard, authGuard } from '@core/auth/auth.guard';

/**
 * Root routes. Each feature owns its child routes and is lazy-loaded
 * (one bundle per feature).
 */
export const routes: Routes = [
  { path: 'login', loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: 'library', canActivate: [authGuard], loadChildren: () => import('@features/library/library.routes').then((m) => m.LIBRARY_ROUTES) },
  { path: 'assistant', canActivate: [authGuard], loadChildren: () => import('@features/assistant/assistant.routes').then((m) => m.ASSISTANT_ROUTES) },
  { path: 'admin', canActivate: [adminGuard], loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES) },
  { path: '', pathMatch: 'full', redirectTo: 'library' },
  { path: '**', redirectTo: 'library' },
];
