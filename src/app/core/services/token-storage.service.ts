import { Injectable } from '@angular/core';
import { AuthTokens } from '../models/auth.model';

const STORAGE_KEY = 'autoschool.auth.tokens.v1';
const IMPERSONATOR_STORAGE_KEY = 'autoschool.auth.impersonator.v1';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  read(): AuthTokens | null {
    return this.readKey(STORAGE_KEY);
  }

  write(tokens: AuthTokens): void {
    this.writeKey(STORAGE_KEY, tokens);
  }

  clear(): void {
    this.clearKey(STORAGE_KEY);
  }

  /** Tokens of the admin who is currently impersonating another user, so the session can be restored. */
  readImpersonatorTokens(): AuthTokens | null {
    return this.readKey(IMPERSONATOR_STORAGE_KEY);
  }

  writeImpersonatorTokens(tokens: AuthTokens): void {
    this.writeKey(IMPERSONATOR_STORAGE_KEY, tokens);
  }

  clearImpersonatorTokens(): void {
    this.clearKey(IMPERSONATOR_STORAGE_KEY);
  }

  private readKey(key: string): AuthTokens | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.accessToken && parsed?.refreshToken ? parsed : null;
    } catch {
      return null;
    }
  }

  private writeKey(key: string, tokens: AuthTokens): void {
    try {
      localStorage.setItem(key, JSON.stringify(tokens));
    } catch {
      // localStorage unavailable (e.g. private browsing quota) — session just won't persist.
    }
  }

  private clearKey(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
