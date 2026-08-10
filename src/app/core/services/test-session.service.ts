import { Injectable, computed, inject, signal } from '@angular/core';
import { Question } from '../models/question.model';
import { TestSummary } from '../models/test.model';
import { ProgressService } from './progress.service';
import { MissedQuestionsService } from './missed-questions.service';
import { DataService } from './data.service';
import { MISSED_TEST_ID } from '../constants';

export const SECONDS_PER_QUESTION = 60;

@Injectable({ providedIn: 'root' })
export class TestSessionService {
  private readonly progress = inject(ProgressService);
  private readonly missedQuestions = inject(MissedQuestionsService);
  private readonly dataService = inject(DataService);
  private readonly _test = signal<TestSummary | undefined>(undefined);
  private readonly _questions = signal<Question[]>([]);
  private readonly _currentIndex = signal(0);
  private readonly _answers = signal<Record<string, string>>({});
  private readonly _markedForReview = signal<ReadonlySet<string>>(new Set());
  private readonly _startedAt = signal(0);
  private readonly _finishedAt = signal<number | undefined>(undefined);

  readonly test = this._test.asReadonly();
  readonly questions = this._questions.asReadonly();
  readonly currentIndex = this._currentIndex.asReadonly();
  readonly answers = this._answers.asReadonly();

  readonly currentQuestion = computed(() => this._questions()[this._currentIndex()]);
  readonly totalQuestions = computed(() => this._questions().length);
  readonly isFirstQuestion = computed(() => this._currentIndex() === 0);
  readonly isLastQuestion = computed(() => this._currentIndex() === this.totalQuestions() - 1);
  readonly timeBudgetSeconds = computed(() => this.totalQuestions() * SECONDS_PER_QUESTION);

  readonly selectedOptionId = computed(() => {
    const q = this.currentQuestion();
    return q ? this._answers()[q.id] : undefined;
  });

  readonly isCurrentAnswered = computed(() => this.selectedOptionId() !== undefined);
  readonly allAnswered = computed(() =>
    this._questions().every((q) => this._answers()[q.id] !== undefined),
  );
  readonly isCurrentMarked = computed(() => {
    const q = this.currentQuestion();
    return q ? this._markedForReview().has(q.id) : false;
  });

  readonly score = computed(() =>
    this._questions().reduce(
      (total, q) => (this._answers()[q.id] === q.correctOptionId ? total + 1 : total),
      0,
    ),
  );

  /**
   * Deliberately a plain method, not a computed() -- it reads Date.now()
   * directly, which isn't a signal, so a computed() would never be marked
   * dirty as real time passes and would freeze at its first-read value.
   * Callers that need it to tick (the countdown clock) drive their own
   * signal (e.g. a setInterval-updated tick()) and call this fresh each time.
   */
  elapsedSeconds(): number {
    const end = this._finishedAt() ?? Date.now();
    return Math.max(0, Math.round((end - this._startedAt()) / 1000));
  }

  start(test: TestSummary, questions: Question[]): void {
    this._test.set(test);
    this._questions.set(questions);
    this._currentIndex.set(0);
    this._answers.set({});
    this._markedForReview.set(new Set());
    this._startedAt.set(Date.now());
    this._finishedAt.set(undefined);
  }

  selectOption(optionId: string): void {
    const q = this.currentQuestion();
    if (!q) return;
    this._answers.update((answers) => ({ ...answers, [q.id]: optionId }));
  }

  toggleMarkForReview(): void {
    const q = this.currentQuestion();
    if (!q) return;
    this._markedForReview.update((marked) => {
      const next = new Set(marked);
      next.has(q.id) ? next.delete(q.id) : next.add(q.id);
      return next;
    });
  }

  goNext(): void {
    if (this._currentIndex() < this.totalQuestions() - 1) {
      this._currentIndex.update((i) => i + 1);
    }
  }

  goPrevious(): void {
    if (this._currentIndex() > 0) {
      this._currentIndex.update((i) => i - 1);
    }
  }

  /**
   * Client-side `score`/`elapsedSeconds` above drive the instant Results/Review UI so
   * navigation doesn't block on a network round-trip. The server recomputes the score
   * authoritatively from `POST /attempts` and that becomes the record of truth; this
   * submission runs as a fire-and-forget side effect (see `ProgressService.submitStatus`).
   */
  finish(): void {
    if (this._finishedAt() !== undefined) return;
    this._finishedAt.set(Date.now());

    const test = this._test();
    if (test) {
      this.progress.recordAndSync(
        {
          testId: test.id === MISSED_TEST_ID ? null : test.id,
          testTitle: test.title,
          questionIds: this._questions().map((q) => q.id),
          answers: this._answers(),
          elapsedSeconds: this.elapsedSeconds(),
        },
        () => {
          this.missedQuestions.refresh();
          this.dataService.refreshTests();
        },
      );
    }
  }

  isActiveFor(testId: string): boolean {
    return this._test()?.id === testId && this._questions().length > 0;
  }

  clear(): void {
    this._test.set(undefined);
    this._questions.set([]);
    this._currentIndex.set(0);
    this._answers.set({});
    this._markedForReview.set(new Set());
    this._finishedAt.set(undefined);
  }
}
