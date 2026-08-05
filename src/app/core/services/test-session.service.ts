import { Injectable, computed, inject, signal } from '@angular/core';
import { Question } from '../models/question.model';
import { TestSummary } from '../models/test.model';
import { ProgressService } from './progress.service';
import { MissedQuestionsService } from './missed-questions.service';

export const SECONDS_PER_QUESTION = 60;

@Injectable({ providedIn: 'root' })
export class TestSessionService {
  private readonly progress = inject(ProgressService);
  private readonly missedQuestions = inject(MissedQuestionsService);
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
  readonly isLastQuestion = computed(() => this._currentIndex() === this.totalQuestions() - 1);
  readonly timeBudgetSeconds = computed(() => this.totalQuestions() * SECONDS_PER_QUESTION);

  readonly selectedOptionId = computed(() => {
    const q = this.currentQuestion();
    return q ? this._answers()[q.id] : undefined;
  });

  readonly isCurrentAnswered = computed(() => this.selectedOptionId() !== undefined);
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

  readonly elapsedSeconds = computed(() => {
    const end = this._finishedAt() ?? Date.now();
    return Math.max(0, Math.round((end - this._startedAt()) / 1000));
  });

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
    if (!q || this.isCurrentAnswered()) return;
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

  finish(): void {
    if (this._finishedAt() !== undefined) return;
    this._finishedAt.set(Date.now());

    const test = this._test();
    if (test) {
      this.progress.record({
        testId: test.id,
        testTitle: test.title,
        score: this.score(),
        total: this.totalQuestions(),
        elapsedSeconds: this.elapsedSeconds(),
      });
    }

    const correctOptionByQuestionId: Record<string, string> = {};
    for (const q of this._questions()) {
      correctOptionByQuestionId[q.id] = q.correctOptionId;
    }
    this.missedQuestions.recordAnswers(this._answers(), correctOptionByQuestionId);
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
