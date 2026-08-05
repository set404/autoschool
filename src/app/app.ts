import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ThemeService } from './core/services/theme.service';
import { BottomNavComponent, NavTab } from './shared/bottom-nav/bottom-nav.component';

function tabForUrl(url: string): NavTab | null {
  const path = url.split('?')[0].split('#')[0];
  if (path === '/') return 'practice';
  if (path.startsWith('/tests')) return 'tests';
  if (path.startsWith('/lessons')) return 'lessons';
  if (path.startsWith('/statistics')) return 'statistics';
  if (path.startsWith('/profile')) return 'profile';
  if (path.startsWith('/test/')) {
    // The post-test ad interstitial is a full-screen moment — no tab bar there.
    return path.endsWith('/ad') ? null : 'practice';
  }
  return 'practice';
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly activeTab = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => tabForUrl(event.urlAfterRedirects)),
      startWith(tabForUrl(this.router.url)),
    ),
    { initialValue: tabForUrl(this.router.url) },
  );
}
