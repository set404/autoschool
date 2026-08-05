import { Injectable, computed, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'autoschool.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.readStored());

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    this.apply(this._theme());
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.apply(theme);
  }

  toggle(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private readStored(): Theme {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  }
}
