import { Injectable } from '@angular/core';
import { AD_CONFIG, isAdSenseConfigured } from '../ad.config';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Injects the AdSense script tag into the page at most once. */
@Injectable({ providedIn: 'root' })
export class AdsenseLoaderService {
  private loaded = false;

  ensureLoaded(): void {
    if (this.loaded || !isAdSenseConfigured()) return;
    this.loaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.publisherId}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }

  pushAd(): void {
    if (!isAdSenseConfigured()) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not yet ready (e.g. blocked by an ad blocker) — ignore.
    }
  }
}
