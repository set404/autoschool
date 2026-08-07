import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { switchMap, of } from 'rxjs';
import { TranslatePipe } from '../../../core/services/translate.pipe';
import { LocalizePipe } from '../../../core/services/localize.pipe';
import { IconComponent } from '../../../shared/icon/icon.component';
import { TopBarComponent } from '../../../shared/top-bar/top-bar.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { AuthUser } from '../../../core/models/auth.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [DatePipe, TranslatePipe, LocalizePipe, IconComponent, TopBarComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss',
})
export class TeacherDashboardComponent {
  private readonly teacherService = inject(TeacherService);

  protected readonly students = toSignal(this.teacherService.listStudents(), { initialValue: [] });
  protected readonly selectedStudent = signal<AuthUser | null>(null);

  private readonly selectedStudentId = toObservable(this.selectedStudent);

  protected readonly stats = toSignal(
    this.selectedStudentId.pipe(
      switchMap((student) => (student ? this.teacherService.getStudentStats(student.id) : of(null))),
    ),
    { initialValue: null },
  );

  protected readonly attempts = toSignal(
    this.selectedStudentId.pipe(
      switchMap((student) => (student ? this.teacherService.listStudentAttempts(student.id) : of([]))),
    ),
    { initialValue: [] },
  );

  selectStudent(student: AuthUser): void {
    this.selectedStudent.set(this.selectedStudent()?.id === student.id ? null : student);
  }
}
