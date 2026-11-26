import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { API_ENDPOINTS } from '@core/config/api-endpoints';
import { AuthResponse, User } from './auth.model';

/**
 * Session state holder.
 * The short-lived access token lives in memory only (never in localStorage);
 * the refresh token is an httpOnly cookie managed by the API.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private accessToken: string | null = null;

  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  getAccessToken(): string | null {
    return this.accessToken;
  }

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<AuthResponse>(API_ENDPOINTS.auth.login, { email, password }, { withCredentials: true })
      .pipe(tap((response) => this.startSession(response)), map(() => undefined));
  }

  register(fullName: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(API_ENDPOINTS.auth.register, { fullName, email, password });
  }

  /** Silently reopens a session from the refresh cookie (page reload, expired token). */
  refresh(): Observable<string | null> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.auth.refresh, {}, { withCredentials: true }).pipe(
      tap((response) => this.startSession(response)),
      map((response) => response.accessToken),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  logout(): void {
    this.http.post(API_ENDPOINTS.auth.logout, {}, { withCredentials: true }).subscribe();
    this.clearSession();
  }

  private startSession({ user, accessToken }: AuthResponse): void {
    this.accessToken = accessToken;
    this.user.set(user);
  }

  private clearSession(): void {
    this.accessToken = null;
    this.user.set(null);
  }
}
