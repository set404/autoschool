import { Injectable } from '@angular/core';
import { AuthTokens } from '../models/auth.model';

const STORAGE_KEY = 'autoschool.auth.tokens.v1';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  read(): AuthTokens | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.accessToken && parsed?.refreshToken ? parsed : null;
    } catch {
      return null;
    }
  }

  write(tokens: AuthTokens): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    } catch {
      // localStorage unavailable (e.g. private browsing quota) — session just won't persist.
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
