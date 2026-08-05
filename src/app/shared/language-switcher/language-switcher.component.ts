import { Component, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { Lang } from '../../core/models/i18n.model';
import { TranslatePipe } from '../../core/services/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent {
  protected readonly i18n = inject(I18nService);

  select(lang: Lang): void {
    this.i18n.setLang(lang);
  }
}
