import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResult, AuthUser } from '../models/auth.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly _currentUser = signal<AuthUser | null>(null);
  private readonly _initializing = signal<boolean>(true);
  private readonly readyPromise: Promise<boolean>;

  private readonly _isImpersonating = signal<boolean>(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly initializing = this._initializing.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly isImpersonating = this._isImpersonating.asReadonly();

  constructor() {
    this._isImpersonating.set(!!this.tokenStorage.readImpersonatorTokens());
    const tokens = this.tokenStorage.read();
    if (!tokens) {
      this._initializing.set(false);
      this.readyPromise = Promise.resolve(false);
      return;
    }
    // Deferred to a microtask: firing the HTTP call synchronously here would route
    // through authInterceptor, which injects AuthService — but this constructor
    // hasn't returned yet, so the DI container hasn't finished registering the
    // singleton, causing an NG0200 circular-dependency error.
    this.readyPromise = new Promise<boolean>((resolve) => {
      queueMicrotask(() => {
        this.http
          .get<AuthUser>(`${environment.apiUrl}/auth/me`)
          .pipe(catchError(() => of(null)))
          .subscribe((user) => {
            this._currentUser.set(user);
            this._initializing.set(false);
            resolve(!!user);
          });
      });
    });
  }

  /** Resolves once the initial session-restore check (GET /auth/me) has completed. */
  waitUntilReady(): Promise<boolean> {
    return this.readyPromise;
  }

  register(params: { email: string; password: string; name: string }): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/register`, params)
      .pipe(tap((result) => this.applyAuthResult(result)));
  }

  login(params: { email: string; password: string }): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/login`, params)
      .pipe(tap((result) => this.applyAuthResult(result)));
  }

  refresh(): Observable<AuthResult | null> {
    const tokens = this.tokenStorage.read();
    if (!tokens) return of(null);
    return this.http
      .post<AuthResult>(`${environment.apiUrl}/auth/refresh`, { refreshToken: tokens.refreshToken })
      .pipe(
        tap((result) => this.applyAuthResult(result)),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
      );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  /** Admin-only: mint a session for another user without their password, stashing the admin's own tokens. */
  impersonate(userId: string): Observable<AuthResult> {
    const adminTokens = this.tokenStorage.read();
    return this.http.post<AuthResult>(`${environment.apiUrl}/auth/impersonate/${userId}`, {}).pipe(
      tap((result) => {
        if (adminTokens) {
          this.tokenStorage.writeImpersonatorTokens(adminTokens);
          this._isImpersonating.set(true);
        }
        this.applyAuthResult(result);
      }),
    );
  }

  /** Swap back to the stashed admin session after impersonating a user. */
  returnToAdmin(): void {
    const adminTokens = this.tokenStorage.readImpersonatorTokens();
    if (!adminTokens) return;
    this.tokenStorage.clearImpersonatorTokens();
    this.tokenStorage.write(adminTokens);
    this._isImpersonating.set(false);
  }

  getAccessToken(): string | null {
    return this.tokenStorage.read()?.accessToken ?? null;
  }

  uploadAvatar(file: File): Observable<AuthUser> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http
      .post<AuthUser>(`${environment.apiUrl}/auth/me/avatar`, formData)
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  removeAvatar(): Observable<AuthUser> {
    return this.http
      .delete<AuthUser>(`${environment.apiUrl}/auth/me/avatar`)
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this._currentUser.set(null);
  }

  private applyAuthResult(result: AuthResult): void {
    this.tokenStorage.write({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    this._currentUser.set(result.user);
  }
}
