import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../models/auth.model';
import { TestAttempt } from '../models/attempt.model';
import { StudentStats } from '../models/teacher.model';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private readonly http = inject(HttpClient);

  listStudents(): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>(`${environment.apiUrl}/teacher/students`);
  }

  listStudentAttempts(studentId: string): Observable<TestAttempt[]> {
    return this.http.get<TestAttempt[]>(`${environment.apiUrl}/teacher/students/${studentId}/attempts`);
  }

  getStudentStats(studentId: string): Observable<StudentStats> {
    return this.http.get<StudentStats>(`${environment.apiUrl}/teacher/students/${studentId}/stats`);
  }
}
