import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'autoschool.missed-questions.v1';

function loadIds(): string[] {
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
export class MissedQuestionsService {
  private readonly _ids = signal<string[]>(loadIds());

  /** Question ids currently answered incorrectly and not yet redeemed by a correct answer. */
  readonly ids = this._ids.asReadonly();
  readonly count = computed(() => this._ids().length);

  /**
   * Reconciles the missed pool against a just-finished attempt: questions answered
   * correctly are removed (redeemed), questions answered incorrectly are added.
   * Unanswered questions are left untouched.
   */
  recordAnswers(answers: Record<string, string>, correctOptionByQuestionId: Record<string, string>): void {
    const current = new Set(this._ids());
    for (const [questionId, selectedOptionId] of Object.entries(answers)) {
      const correctOptionId = correctOptionByQuestionId[questionId];
      if (correctOptionId === undefined) continue;
      if (selectedOptionId === correctOptionId) {
        current.delete(questionId);
      } else {
        current.add(questionId);
      }
    }
    const next = [...current];
    this._ids.set(next);
    this.persist(next);
  }

  private persist(ids: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // localStorage unavailable — missed-question tracking just won't persist.
    }
  }
}
