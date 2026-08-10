import { Component, computed, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { TranslatePipe } from '../../../core/services/translate.pipe';
import { IconComponent } from '../../../shared/icon/icon.component';
import { TopBarComponent } from '../../../shared/top-bar/top-bar.component';
import { SkeletonComponent } from '../../../shared/skeleton/skeleton.component';
import { AdminService } from '../../../core/services/admin.service';
import { AuthUser, Role } from '../../../core/models/auth.model';
import { Assignment } from '../../../core/models/assignment.model';

type AdminTab = 'users' | 'assignments';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [TranslatePipe, IconComponent, TopBarComponent, SkeletonComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly adminService = inject(AdminService);

  protected readonly skeletonRows = [0, 1, 2];
  protected readonly tab = signal<AdminTab>('users');
  protected readonly users = signal<AuthUser[]>([]);
  protected readonly usersLoading = signal(true);
  protected readonly assignments = signal<Assignment[]>([]);
  protected readonly assignmentsLoading = signal(true);

  protected readonly teachers = computed(() => this.users().filter((u) => u.role === 'TEACHER'));
  protected readonly students = computed(() => this.users().filter((u) => u.role === 'STUDENT'));

  protected readonly newUserName = signal('');
  protected readonly newUserEmail = signal('');
  protected readonly newUserPassword = signal('');
  protected readonly newUserRole = signal<Role>('STUDENT');
  protected readonly createUserError = signal<string | null>(null);
  protected readonly creatingUser = signal(false);

  protected readonly newAssignmentTeacherId = signal('');
  protected readonly newAssignmentStudentId = signal('');
  protected readonly createAssignmentError = signal<string | null>(null);
  protected readonly creatingAssignment = signal(false);

  constructor() {
    this.refreshUsers();
    this.refreshAssignments();
  }

  setTab(tab: AdminTab): void {
    this.tab.set(tab);
  }

  private refreshUsers(): void {
    this.usersLoading.set(true);
    this.adminService
      .listUsers()
      .pipe(catchError(() => of([])))
      .subscribe((users) => {
        this.users.set(users);
        this.usersLoading.set(false);
      });
  }

  private refreshAssignments(): void {
    this.assignmentsLoading.set(true);
    this.adminService
      .listAssignments()
      .pipe(catchError(() => of([])))
      .subscribe((assignments) => {
        this.assignments.set(assignments);
        this.assignmentsLoading.set(false);
      });
  }

  createUser(): void {
    if (this.creatingUser()) return;
    this.createUserError.set(null);
    this.creatingUser.set(true);

    this.adminService
      .createUser({
        name: this.newUserName().trim(),
        email: this.newUserEmail().trim(),
        password: this.newUserPassword(),
        role: this.newUserRole(),
      })
      .pipe(
        catchError(() => {
          this.createUserError.set('admin.createUserError');
          return of(null);
        }),
      )
      .subscribe((user) => {
        this.creatingUser.set(false);
        if (user) {
          this.newUserName.set('');
          this.newUserEmail.set('');
          this.newUserPassword.set('');
          this.newUserRole.set('STUDENT');
          this.refreshUsers();
        }
      });
  }

  changeRole(user: AuthUser, role: Role): void {
    this.adminService.updateUserRole(user.id, role).subscribe(() => this.refreshUsers());
  }

  deleteUser(user: AuthUser): void {
    this.adminService.deleteUser(user.id).subscribe(() => {
      this.refreshUsers();
      this.refreshAssignments();
    });
  }

  createAssignment(): void {
    if (this.creatingAssignment()) return;
    const teacherId = this.newAssignmentTeacherId();
    const studentId = this.newAssignmentStudentId();
    if (!teacherId || !studentId) {
      this.createAssignmentError.set('admin.assignmentSelectError');
      return;
    }

    this.createAssignmentError.set(null);
    this.creatingAssignment.set(true);
    this.adminService
      .createAssignment(teacherId, studentId)
      .pipe(
        catchError(() => {
          this.createAssignmentError.set('admin.createAssignmentError');
          return of(null);
        }),
      )
      .subscribe((assignment) => {
        this.creatingAssignment.set(false);
        if (assignment) {
          this.newAssignmentTeacherId.set('');
          this.newAssignmentStudentId.set('');
          this.refreshAssignments();
        }
      });
  }

  removeAssignment(assignment: Assignment): void {
    this.adminService.removeAssignment(assignment.id).subscribe(() => this.refreshAssignments());
  }
}
