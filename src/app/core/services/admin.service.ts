import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, Role } from '../models/auth.model';
import { Assignment } from '../models/assignment.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  listUsers(role?: Role): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>(`${environment.apiUrl}/users`, {
      params: role ? { role } : {},
    });
  }

  createUser(params: { email: string; password: string; name: string; role: Role }): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiUrl}/users`, params);
  }

  updateUserRole(userId: string, role: Role): Observable<AuthUser> {
    return this.http.patch<AuthUser>(`${environment.apiUrl}/users/${userId}/role`, { role });
  }

  deleteUser(userId: string): Observable<{ success: true }> {
    return this.http.delete<{ success: true }>(`${environment.apiUrl}/users/${userId}`);
  }

  listAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${environment.apiUrl}/admin/assignments`);
  }

  createAssignment(teacherId: string, studentId: string): Observable<Assignment> {
    return this.http.post<Assignment>(`${environment.apiUrl}/admin/assignments`, { teacherId, studentId });
  }

  removeAssignment(assignmentId: string): Observable<{ success: true }> {
    return this.http.delete<{ success: true }>(`${environment.apiUrl}/admin/assignments/${assignmentId}`);
  }
}
