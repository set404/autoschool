import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TestSessionService } from '../../core/services/test-session.service';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { AdBannerComponent } from '../../shared/ad-banner/ad-banner.component';
import { AD_CONFIG, isAdSenseConfigured } from '../../core/ad.config';

const SKIP_DELAY_SECONDS = 5;

@Component({
  selector: 'app-test-complete-ad',
  standalone: true,
  imports: [TranslatePipe, TopBarComponent, AdBannerComponent],
  templateUrl: './test-complete-ad.component.html',
  styleUrl: './test-complete-ad.component.scss',
})
export class TestCompleteAdComponent {
  readonly id = input.required<string>();

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly session = inject(TestSessionService);
  protected readonly adSlotId = AD_CONFIG.interstitialSlotId;
  protected readonly secondsLeft = signal(isAdSenseConfigured() ? SKIP_DELAY_SECONDS : 0);

  constructor() {
    effect(() => {
      const id = this.id();
      if (!this.session.isActiveFor(id)) {
        this.router.navigateByUrl('/');
      } else if (!isAdSenseConfigured()) {
        // Nothing to show yet — skip straight to results instead of an empty screen.
        this.router.navigate(['/test', id, 'results']);
      }
    });

    if (this.secondsLeft() > 0) {
      const intervalId = setInterval(() => {
        this.secondsLeft.update((n) => Math.max(0, n - 1));
      }, 1000);
      this.destroyRef.onDestroy(() => clearInterval(intervalId));
    }
  }

  continue(): void {
    if (this.secondsLeft() > 0) return;
    this.router.navigate(['/test', this.id(), 'results']);
  }
}
