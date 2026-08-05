import { Injectable, computed, signal } from '@angular/core';
import { TestAttempt } from '../models/attempt.model';
import { LocalizedText } from '../models/i18n.model';
import { PASS_RATIO } from '../constants';

const STORAGE_KEY = 'autoschool.progress.v1';

function loadAttempts(): TestAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly _attempts = signal<TestAttempt[]>(loadAttempts());

  /** Most recent attempt first. */
  readonly attempts = this._attempts.asReadonly();

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

  record(params: {
    testId: string;
    testTitle: LocalizedText;
    score: number;
    total: number;
    elapsedSeconds: number;
  }): void {
    const percentage = params.total > 0 ? Math.round((params.score / params.total) * 100) : 0;
    const attempt: TestAttempt = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      testId: params.testId,
      testTitle: params.testTitle,
      score: params.score,
      total: params.total,
      percentage,
      passed: percentage >= Math.round(PASS_RATIO * 100),
      elapsedSeconds: params.elapsedSeconds,
      completedAt: Date.now(),
    };
    const next = [attempt, ...this._attempts()];
    this._attempts.set(next);
    this.persist(next);
  }

  private persist(attempts: TestAttempt[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    } catch {
      // localStorage unavailable (e.g. private browsing quota) — progress just won't persist.
    }
  }
}
