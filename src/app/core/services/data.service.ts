import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Question } from '../models/question.model';
import { TestSummary } from '../models/test.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly http = inject(HttpClient);

  getTests(): Observable<TestSummary[]> {
    return this.http.get<TestSummary[]>(`${environment.apiUrl}/tests`);
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
