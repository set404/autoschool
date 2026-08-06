import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { DEFAULT_LANG, Lang, SUPPORTED_LANGS } from '../models/i18n.model';

const STORAGE_KEY = 'autoschool.lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);

  private readonly _lang = signal<Lang>(this.readStoredLang());
  private readonly _strings = signal<Record<string, string>>({});

  readonly lang = this._lang.asReadonly();
  readonly strings = this._strings.asReadonly();
  readonly supportedLangs = SUPPORTED_LANGS;

  constructor() {
    this.loadLang(this._lang());
  }

  setLang(lang: Lang): void {
    if (lang === this._lang()) return;
    this._lang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    this.loadLang(lang);
  }

  translate(key: string, params?: Record<string, string | number>): string {
    let value = this._strings()[key] ?? key;
    if (params) {
      for (const [param, replacement] of Object.entries(params)) {
        value = value.replace(new RegExp(`{${param}}`, 'g'), String(replacement));
      }
    }
    return value;
  }

  private loadLang(lang: Lang): void {
    this.http.get<Record<string, string>>(`i18n/${lang}.json`).subscribe((strings) => {
      this._strings.set(strings);
      document.documentElement.lang = lang;
    });
  }

  private readStoredLang(): Lang {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    return stored && SUPPORTED_LANGS.includes(stored) ? stored : DEFAULT_LANG;
  }
}
