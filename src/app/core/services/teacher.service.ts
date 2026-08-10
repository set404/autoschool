import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../models/auth.model';
import { TestAttempt } from '../models/attempt.model';
import { StudentStats } from '../models/teacher.model';
import { Comment } from '../models/comment.model';

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

  addComment(studentId: string, attemptId: string, body: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${environment.apiUrl}/teacher/students/${studentId}/attempts/${attemptId}/comments`,
      { body },
    );
  }

  deleteComment(commentId: string): Observable<{ success: true }> {
    return this.http.delete<{ success: true }>(`${environment.apiUrl}/teacher/comments/${commentId}`);
  }
}
