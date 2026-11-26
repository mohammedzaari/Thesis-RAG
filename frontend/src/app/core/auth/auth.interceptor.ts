import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '@core/config/api-endpoints';
import { AuthService } from './auth.service';

const withToken = (request: HttpRequest<unknown>, token: string | null) =>
  token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

/** Adds the Bearer token and retries once after a silent refresh on HTTP 401. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const isAuthCall = request.url.startsWith(API_ENDPOINTS.auth.prefix);

  return next(withToken(request, auth.getAccessToken())).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthCall) return throwError(() => error);
      return auth.refresh().pipe(
        switchMap((token) => (token ? next(withToken(request, token)) : throwError(() => error))),
      );
    }),
  );
};
