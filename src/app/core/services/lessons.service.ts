import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lesson } from '../models/lesson.model';

@Injectable({ providedIn: 'root' })
export class LessonsService {
  private readonly http = inject(HttpClient);

  list(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${environment.apiUrl}/lessons`);
  }
}
