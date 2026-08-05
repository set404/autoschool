export const SUPPORTED_LANGS = ['hy', 'en', 'ru'] as const;

export type Lang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: Lang = 'hy';

export type LocalizedText = Record<Lang, string>;
