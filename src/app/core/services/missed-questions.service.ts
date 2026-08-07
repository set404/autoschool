import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Question } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class MissedQuestionsService {
  private readonly http = inject(HttpClient);

  private readonly _questions = signal<Question[]>([]);

  /** Questions the current user has most recently answered incorrectly and not yet redeemed. */
  readonly questions = this._questions.asReadonly();
  readonly ids = computed(() => this._questions().map((q) => q.id));
  readonly count = computed(() => this._questions().length);

  constructor() {
    this.refresh();
  }

  /** Re-fetches the missed set from the server — call after a test attempt is submitted. */
  refresh(): void {
    this.http
      .get<Question[]>(`${environment.apiUrl}/attempts/missed`)
      .pipe(catchError(() => of([])))
      .subscribe((questions) => this._questions.set(questions));
  }
}
