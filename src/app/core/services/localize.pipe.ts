import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocalizedText } from '../models/i18n.model';
import { I18nService } from './i18n.service';

@Pipe({ name: 'localize', pure: false, standalone: true })
export class LocalizePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(value: LocalizedText | undefined): string {
    if (!value) return '';
    return value[this.i18n.lang()] ?? value[Object.keys(value)[0] as keyof LocalizedText] ?? '';
  }
}
