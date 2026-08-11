import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { I18nService } from '../../core/services/i18n.service';
import { Lang } from '../../core/models/i18n.model';
import { IconComponent } from '../icon/icon.component';

const MINUTE_STEP = 5;

// Hardcoded rather than sourced from Intl.DateTimeFormat: this app's target browsers
// (including some Chromium builds without full ICU data) don't reliably ship an `hy-AM`
// locale, silently falling back to English month/weekday names.
const MONTH_NAMES: Record<Lang, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  hy: [
    'Հունվար',
    'Փետրվար',
    'Մարտ',
    'Ապրիլ',
    'Մայիս',
    'Հունիս',
    'Հուլիս',
    'Օգոստոս',
    'Սեպտեմբեր',
    'Հոկտեմբեր',
    'Նոյեմբեր',
    'Դեկտեմբեր',
  ],
  ru: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
};

const WEEKDAY_NAMES: Record<Lang, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  hy: ['Կիր', 'Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շաբ'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
};

interface DayCell {
  date: Date;
  day: number;
  inCurrentMonth: boolean;
  disabled: boolean;
}

function parseLocalDateTime(value: string): Date | null {
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split('-').map(Number);
  const [h, min] = timePart.split(':').map(Number);
  if ([y, m, d, h, min].some((n) => Number.isNaN(n))) return null;
  return new Date(y, m - 1, d, h, min);
}

function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

@Component({
  selector: 'app-datetime-picker',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  templateUrl: './datetime-picker.component.html',
  styleUrl: './datetime-picker.component.scss',
})
export class DatetimePickerComponent {
  private readonly i18n = inject(I18nService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly value = input<string>('');
  readonly valueChange = output<string>();
  readonly placeholder = input<string>('');
  /** Days strictly before this date (whole-day granularity) are disabled. */
  readonly minDate = input<Date | null>(null);

  protected readonly today = new Date();
  protected readonly open = signal(false);
  protected readonly viewDate = signal(new Date());
  protected readonly draftDay = signal<Date | null>(null);
  protected readonly draftHour = signal(9);
  protected readonly draftMinute = signal(0);
  /** Raw text shown in the hour/minute fields while editing — kept separate from the
   * committed draftHour/draftMinute so re-rendering a padded value mid-keystroke doesn't
   * reset the input and swallow the digit the user just typed. */
  protected readonly hourInputValue = signal('');
  protected readonly minuteInputValue = signal('');

  private readonly parsedValue = computed(() => {
    const raw = this.value();
    return raw ? parseLocalDateTime(raw) : null;
  });

  protected readonly displayText = computed(() => {
    const d = this.parsedValue();
    if (!d) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const months = MONTH_NAMES[this.i18n.lang()];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  protected readonly monthLabel = computed(() => {
    const v = this.viewDate();
    return `${MONTH_NAMES[this.i18n.lang()][v.getMonth()]} ${v.getFullYear()}`;
  });

  protected readonly weekdayLabels = computed(() => WEEKDAY_NAMES[this.i18n.lang()]);

  protected readonly days = computed<DayCell[]>(() => {
    const view = this.viewDate();
    const year = view.getFullYear();
    const month = view.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const gridStart = new Date(year, month, 1 - startOffset);
    const min = this.minDate();
    const minMidnight = min ? new Date(min.getFullYear(), min.getMonth(), min.getDate()) : null;

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      return {
        date,
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === month,
        disabled: minMidnight ? date.getTime() < minMidnight.getTime() : false,
      };
    });
  });

  toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  close(): void {
    this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.close();
    }
  }

  private openPanel(): void {
    const current = this.parsedValue() ?? this.defaultDraftDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth(), 1));
    this.draftDay.set(new Date(current.getFullYear(), current.getMonth(), current.getDate()));
    this.draftHour.set(current.getHours());
    this.draftMinute.set(Math.round(current.getMinutes() / MINUTE_STEP) * MINUTE_STEP);
    this.hourInputValue.set(String(this.draftHour()).padStart(2, '0'));
    this.minuteInputValue.set(String(this.draftMinute()).padStart(2, '0'));
    this.open.set(true);
  }

  private defaultDraftDate(): Date {
    const min = this.minDate();
    const base = min && min.getTime() > Date.now() ? min : new Date();
    const rounded = new Date(base);
    rounded.setSeconds(0, 0);
    rounded.setMinutes(Math.ceil(rounded.getMinutes() / MINUTE_STEP) * MINUTE_STEP);
    return rounded;
  }

  prevMonth(): void {
    const v = this.viewDate();
    this.viewDate.set(new Date(v.getFullYear(), v.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const v = this.viewDate();
    this.viewDate.set(new Date(v.getFullYear(), v.getMonth() + 1, 1));
  }

  selectDay(cell: DayCell): void {
    if (cell.disabled) return;
    this.draftDay.set(cell.date);
  }

  adjustHour(delta: number): void {
    const next = (this.draftHour() + delta + 24) % 24;
    this.draftHour.set(next);
    this.hourInputValue.set(String(next).padStart(2, '0'));
  }

  adjustMinute(delta: number): void {
    const next = (this.draftMinute() + delta + 60) % 60;
    this.draftMinute.set(next);
    this.minuteInputValue.set(String(next).padStart(2, '0'));
  }

  /** Just tracks what's being typed — no clamping/padding until commitHourInput, so a
   * digit typed mid-entry (e.g. the "2" in "12") never gets clobbered by a re-render. */
  setHourInput(raw: string): void {
    this.hourInputValue.set(raw.replace(/\D/g, '').slice(0, 2));
  }

  setMinuteInput(raw: string): void {
    this.minuteInputValue.set(raw.replace(/\D/g, '').slice(0, 2));
  }

  commitHourInput(): void {
    const n = Number(this.hourInputValue());
    const clamped = Number.isNaN(n) ? this.draftHour() : Math.min(23, Math.max(0, n));
    this.draftHour.set(clamped);
    this.hourInputValue.set(String(clamped).padStart(2, '0'));
  }

  commitMinuteInput(): void {
    const n = Number(this.minuteInputValue());
    const clamped = Number.isNaN(n) ? this.draftMinute() : Math.min(59, Math.max(0, n));
    this.draftMinute.set(clamped);
    this.minuteInputValue.set(String(clamped).padStart(2, '0'));
  }

  confirm(): void {
    const day = this.draftDay();
    if (!day) return;
    this.commitHourInput();
    this.commitMinuteInput();
    const result = new Date(day.getFullYear(), day.getMonth(), day.getDate(), this.draftHour(), this.draftMinute());
    this.valueChange.emit(toLocalDateTimeString(result));
    this.close();
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
  }
}
