import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Question } from '../models/question.model';
import { TestSummary } from '../models/test.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly http = inject(HttpClient);

  private readonly _tests = signal<TestSummary[]>([]);
  private readonly _testsLoading = signal(true);

  /** The test catalog, fetched once and cached — call refreshTests() to invalidate. */
  readonly tests = this._tests.asReadonly();
  readonly testsLoading = this._testsLoading.asReadonly();

  constructor() {
    this.refreshTests();
  }

  /** Re-fetches the test catalog from the server — call after a test attempt is submitted. */
  refreshTests(): void {
    this._testsLoading.set(true);
    this.http
      .get<TestSummary[]>(`${environment.apiUrl}/tests`)
      .pipe(catchError(() => of([])))
      .subscribe((tests) => {
        this._tests.set(tests);
        this._testsLoading.set(false);
      });
  }

  getTest(testId: string): Observable<TestSummary | undefined> {
    return this.http
      .get<TestSummary>(`${environment.apiUrl}/tests/${testId}`)
      .pipe(catchError(() => of(undefined)));
  }

  getQuestionsByIds(ids: string[]): Observable<Question[]> {
    if (ids.length === 0) return of([]);
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.get<Question[]>(`${environment.apiUrl}/questions`, { params });
  }
}
