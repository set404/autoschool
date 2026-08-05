import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TranslatePipe, IconComponent, TopBarComponent, LanguageSwitcherComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  protected readonly themeService = inject(ThemeService);

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
