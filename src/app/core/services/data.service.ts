import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { Question } from '../models/question.model';
import { TestSummary } from '../models/test.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly http = inject(HttpClient);

  private readonly tests$ = this.http
    .get<TestSummary[]>('/data/tests.json')
    .pipe(shareReplay(1));

  private readonly questions$ = this.http
    .get<Question[]>('/data/questions.json')
    .pipe(shareReplay(1));

  getTests(): Observable<TestSummary[]> {
    return this.tests$;
  }

  getTest(testId: string): Observable<TestSummary | undefined> {
    return this.tests$.pipe(map((tests) => tests.find((t) => t.id === testId)));
  }

  getQuestionsByIds(ids: string[]): Observable<Question[]> {
    return this.questions$.pipe(
      map((questions) => {
        const byId = new Map(questions.map((q) => [q.id, q]));
        return ids.map((id) => byId.get(id)).filter((q): q is Question => !!q);
      }),
    );
  }

  getAllQuestions(): Observable<Question[]> {
    return this.questions$;
  }
}
