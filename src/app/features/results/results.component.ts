import { Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TestSessionService } from '../../core/services/test-session.service';
import { LocalizePipe } from '../../core/services/localize.pipe';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { AdBannerComponent } from '../../shared/ad-banner/ad-banner.component';
import { PASS_RATIO } from '../../core/constants';
import { AD_CONFIG } from '../../core/ad.config';

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    LocalizePipe,
    IconComponent,
    TopBarComponent,
    AdBannerComponent,
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent {
  readonly id = input.required<string>();

  private readonly router = inject(Router);

  protected readonly session = inject(TestSessionService);
  protected readonly passThreshold = Math.round(PASS_RATIO * 100);
  protected readonly adSlotId = AD_CONFIG.resultsBannerSlotId;

  constructor() {
    effect(() => {
      if (!this.session.isActiveFor(this.id())) {
        this.router.navigateByUrl('/');
      }
    });
  }

  protected readonly percentage = computed(() => {
    const total = this.session.totalQuestions();
    return total > 0 ? Math.round((this.session.score() / total) * 100) : 0;
  });

  protected readonly passed = computed(() => this.percentage() >= this.passThreshold);

  protected readonly ringStyle = computed(() => {
    const pct = this.percentage();
    return `conic-gradient(var(--color-heading) ${pct}%, var(--color-surface-alt) ${pct}% 100%)`;
  });

  protected readonly timeTakenLabel = computed(() => formatClock(this.session.elapsedSeconds()));
}
