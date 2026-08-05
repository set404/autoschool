import { AfterViewInit, Component, inject, input } from '@angular/core';
import { AD_CONFIG, isAdSenseConfigured } from '../../core/ad.config';
import { AdsenseLoaderService } from '../../core/services/adsense-loader.service';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  templateUrl: './ad-banner.component.html',
  styleUrl: './ad-banner.component.scss',
})
export class AdBannerComponent implements AfterViewInit {
  /** Ad unit id from AdSense ("By ad unit" > your unit > data-ad-slot). */
  readonly slotId = input.required<string>();
  /** Sizing hint, tune per placement (a wide banner vs. a large rectangle). */
  readonly format = input<'auto' | 'rectangle'>('auto');

  private readonly loader = inject(AdsenseLoaderService);

  protected readonly configured = isAdSenseConfigured();
  protected readonly publisherId = AD_CONFIG.publisherId;

  ngAfterViewInit(): void {
    if (!this.configured) return;
    this.loader.ensureLoaded();
    this.loader.pushAd();
  }
}
