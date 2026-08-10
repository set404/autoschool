import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);

  list(attemptId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.apiUrl}/attempts/${attemptId}/comments`);
  }
}
