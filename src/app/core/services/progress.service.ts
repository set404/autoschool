import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestAttempt } from '../models/attempt.model';
import { LocalizedText } from '../models/i18n.model';

export interface SubmitAttemptParams {
  testId: string | null;
  testTitle: LocalizedText;
  questionIds: string[];
  answers: Record<string, string>;
  elapsedSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);

  private readonly _attempts = signal<TestAttempt[]>([]);
  private readonly _submitStatus = signal<'idle' | 'pending' | 'ok' | 'error'>('idle');

  /** Most recent attempt first. */
  readonly attempts = this._attempts.asReadonly();
  readonly submitStatus = this._submitStatus.asReadonly();

  readonly testsTaken = computed(() => this._attempts().length);

  readonly averageScorePercent = computed(() => {
    const attempts = this._attempts();
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((sum, a) => sum + a.percentage, 0);
    return Math.round(total / attempts.length);
  });

  /** Longest run of consecutive passed attempts, in chronological order. */
  readonly bestStreak = computed(() => {
    const chronological = [...this._attempts()].reverse();
    let best = 0;
    let current = 0;
    for (const attempt of chronological) {
      current = attempt.passed ? current + 1 : 0;
      best = Math.max(best, current);
    }
    return best;
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.http
      .get<TestAttempt[]>(`${environment.apiUrl}/attempts`)
      .pipe(catchError(() => of([])))
      .subscribe((attempts) => this._attempts.set(attempts));
  }

  /** Submits the attempt to the server; the server recomputes the score authoritatively. */
  recordAndSync(params: SubmitAttemptParams, onSuccess?: () => void): void {
    this._submitStatus.set('pending');
    this.http
      .post<TestAttempt>(`${environment.apiUrl}/attempts`, params)
      .pipe(
        tap((attempt) => {
          this._attempts.update((attempts) => [attempt, ...attempts]);
        }),
        catchError(() => {
          this._submitStatus.set('error');
          return of(null);
        }),
      )
      .subscribe((attempt) => {
        if (attempt) {
          this._submitStatus.set('ok');
          onSuccess?.();
        }
      });
  }
}
