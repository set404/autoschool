import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Subject, combineLatest, of, startWith, switchMap, tap } from 'rxjs';
import { TranslatePipe } from '../../../core/services/translate.pipe';
import { LocalizePipe } from '../../../core/services/localize.pipe';
import { IconComponent } from '../../../shared/icon/icon.component';
import { TopBarComponent } from '../../../shared/top-bar/top-bar.component';
import { AttemptCommentsComponent } from '../../../shared/attempt-comments/attempt-comments.component';
import { SkeletonComponent } from '../../../shared/skeleton/skeleton.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { AuthUser } from '../../../core/models/auth.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    TranslatePipe,
    LocalizePipe,
    IconComponent,
    TopBarComponent,
    AttemptCommentsComponent,
    SkeletonComponent,
  ],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss',
})
export class TeacherDashboardComponent {
  private readonly teacherService = inject(TeacherService);

  protected readonly skeletonRows = [0, 1, 2];

  protected readonly studentsLoading = signal(true);
  protected readonly students = toSignal(
    this.teacherService.listStudents().pipe(tap(() => this.studentsLoading.set(false))),
    { initialValue: [] },
  );
  protected readonly selectedStudent = signal<AuthUser | null>(null);
  protected readonly expandedAttemptId = signal<string | null>(null);

  private readonly selectedStudentId = toObservable(this.selectedStudent);
  private readonly refreshAttempts$ = new Subject<void>();

  protected readonly statsLoading = signal(false);
  protected readonly stats = toSignal(
    this.selectedStudentId.pipe(
      tap((student) => this.statsLoading.set(!!student)),
      switchMap((student) => (student ? this.teacherService.getStudentStats(student.id) : of(null))),
      tap(() => this.statsLoading.set(false)),
    ),
    { initialValue: null },
  );

  protected readonly attemptsLoading = signal(false);
  protected readonly attempts = toSignal(
    combineLatest([this.selectedStudentId, this.refreshAttempts$.pipe(startWith(undefined))]).pipe(
      tap(([student]) => this.attemptsLoading.set(!!student)),
      switchMap(([student]) => (student ? this.teacherService.listStudentAttempts(student.id) : of([]))),
      tap(() => this.attemptsLoading.set(false)),
    ),
    { initialValue: [] },
  );

  selectStudent(student: AuthUser): void {
    this.expandedAttemptId.set(null);
    this.selectedStudent.set(this.selectedStudent()?.id === student.id ? null : student);
  }

  toggleAttempt(attemptId: string): void {
    this.expandedAttemptId.set(this.expandedAttemptId() === attemptId ? null : attemptId);
  }

  onCommentsChanged(): void {
    this.refreshAttempts$.next();
  }
}
