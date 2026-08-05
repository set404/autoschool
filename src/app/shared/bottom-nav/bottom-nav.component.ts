import { Component, ElementRef, effect, input, signal, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent, IconName } from '../icon/icon.component';
import { TranslatePipe } from '../../core/services/translate.pipe';

export type NavTab = 'practice' | 'tests' | 'lessons' | 'statistics' | 'profile';

interface NavItem {
  tab: NavTab;
  route: string;
  icon: IconName;
  labelKey: string;
}

interface IndicatorStyle {
  transform: string;
  width: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  readonly active = input.required<NavTab>();

  protected readonly items: NavItem[] = [
    { tab: 'practice', route: '/', icon: 'quiz', labelKey: 'nav.practice' },
    { tab: 'tests', route: '/tests', icon: 'list', labelKey: 'nav.tests' },
    { tab: 'lessons', route: '/lessons', icon: 'book', labelKey: 'nav.lessons' },
    { tab: 'statistics', route: '/statistics', icon: 'chart-bar', labelKey: 'nav.statistics' },
    { tab: 'profile', route: '/profile', icon: 'user', labelKey: 'nav.profile' },
  ];

  private readonly linkRefs = viewChildren<ElementRef<HTMLAnchorElement>>('linkRef');

  protected readonly indicatorStyle = signal<IndicatorStyle | null>(null);

  constructor() {
    effect(() => {
      const tab = this.active();
      const refs = this.linkRefs();
      // Wait a frame so the DOM has already reflected the new --active class
      // (label reveal, width change) before we measure its box.
      requestAnimationFrame(() => {
        const index = this.items.findIndex((item) => item.tab === tab);
        const el = refs[index]?.nativeElement;
        if (!el) return;
        this.indicatorStyle.set({
          transform: `translateX(${el.offsetLeft}px)`,
          width: `${el.offsetWidth}px`,
        });
      });
    });
  }
}
