import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Subject, catchError, of, startWith, switchMap, tap } from 'rxjs';
import { TranslatePipe } from '../../../core/services/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { TopBarComponent } from '../../../shared/top-bar/top-bar.component';
import { SkeletonComponent } from '../../../shared/skeleton/skeleton.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { Lesson, LessonType } from '../../../core/models/lesson.model';
import { DatetimePickerComponent } from '../../../shared/datetime-picker/datetime-picker.component';
import { SelectComponent, SelectOption } from '../../../shared/select/select.component';

interface LessonDayGroup {
  dateKey: string;
  scheduledAt: number;
  lessons: Lesson[];
}

function groupByDay(lessons: Lesson[]): LessonDayGroup[] {
  const groups = new Map<string, LessonDayGroup>();
  for (const lesson of lessons) {
    const dateKey = new Date(lesson.scheduledAt).toDateString();
    const group = groups.get(dateKey);
    if (group) {
      group.lessons.push(lesson);
    } else {
      groups.set(dateKey, { dateKey, scheduledAt: lesson.scheduledAt, lessons: [lesson] });
    }
  }
  return [...groups.values()];
}

@Component({
  selector: 'app-teacher-lessons',
  standalone: true,
  imports: [
    DatePipe,
    TranslatePipe,
    IconComponent,
    TopBarComponent,
    SkeletonComponent,
    DatetimePickerComponent,
    SelectComponent,
  ],
  templateUrl: './teacher-lessons.component.html',
  styleUrl: './teacher-lessons.component.scss',
})
export class TeacherLessonsComponent {
  private readonly teacherService = inject(TeacherService);
  private readonly i18n = inject(I18nService);

  protected readonly skeletonRows = [0, 1, 2];
  protected readonly showForm = signal(false);
  protected readonly minScheduleDate = new Date();

  protected readonly students = toSignal(this.teacherService.listStudents(), { initialValue: [] });
  protected readonly studentOptions = computed<SelectOption[]>(() =>
    this.students().map((s) => ({ value: s.id, label: s.name })),
  );

  protected readonly lessonTypeOptions = computed<SelectOption<LessonType>[]>(() => [
    { value: 'OFFLINE', label: this.i18n.translate('teacher.lessonTypeOffline') },
    { value: 'ONLINE', label: this.i18n.translate('teacher.lessonTypeOnline') },
  ]);

  // Schedule Lesson form
  protected readonly newLessonStudentId = signal('');
  protected readonly newLessonDate = signal('');
  protected readonly newLessonDuration = signal(60);
  protected readonly newLessonType = signal<LessonType>('OFFLINE');
  protected readonly newLessonLocation = signal('');
  protected readonly newLessonMeetingLink = signal('');
  protected readonly newLessonNotes = signal('');
  protected readonly creatingLesson = signal(false);
  protected readonly createLessonError = signal<string | null>(null);

  protected readonly lessonsLoading = signal(true);
  private readonly refreshLessons$ = new Subject<void>();
  protected readonly lessons = toSignal(
    this.refreshLessons$.pipe(
      startWith(undefined),
      tap(() => this.lessonsLoading.set(true)),
      switchMap(() => this.teacherService.listTeacherLessons().pipe(catchError(() => of([] as Lesson[])))),
      tap(() => this.lessonsLoading.set(false)),
    ),
    { initialValue: [] as Lesson[] },
  );

  protected readonly upcomingLessonGroups = computed(() =>
    groupByDay(
      this.lessons()
        .filter((l) => l.status === 'SCHEDULED')
        .sort((a, b) => a.scheduledAt - b.scheduledAt),
    ),
  );

  toggleForm(): void {
    this.showForm.set(!this.showForm());
    this.createLessonError.set(null);
  }

  createLesson(): void {
    if (this.creatingLesson()) return;
    const studentId = this.newLessonStudentId();
    if (!studentId) {
      this.createLessonError.set('teacher.lessonStudentError');
      return;
    }

    const dateValue = this.newLessonDate();
    if (!dateValue) {
      this.createLessonError.set('teacher.lessonDateError');
      return;
    }
    const scheduledAt = new Date(dateValue).getTime();
    const type = this.newLessonType();
    const location = this.newLessonLocation().trim();
    const meetingLink = this.newLessonMeetingLink().trim();
    if (type === 'OFFLINE' && !location) {
      this.createLessonError.set('teacher.lessonLocationError');
      return;
    }
    if (type === 'ONLINE' && !meetingLink) {
      this.createLessonError.set('teacher.lessonMeetingLinkError');
      return;
    }

    this.createLessonError.set(null);
    this.creatingLesson.set(true);
    this.teacherService
      .createLesson(studentId, {
        scheduledAt,
        durationMinutes: this.newLessonDuration(),
        type,
        location: type === 'OFFLINE' ? location : undefined,
        meetingLink: type === 'ONLINE' ? meetingLink : undefined,
        notes: this.newLessonNotes().trim() || undefined,
      })
      .pipe(
        catchError(() => {
          this.createLessonError.set('teacher.scheduleLessonError');
          return of(null);
        }),
      )
      .subscribe((lesson) => {
        this.creatingLesson.set(false);
        if (lesson) {
          this.newLessonStudentId.set('');
          this.newLessonDate.set('');
          this.newLessonDuration.set(60);
          this.newLessonType.set('OFFLINE');
          this.newLessonLocation.set('');
          this.newLessonMeetingLink.set('');
          this.newLessonNotes.set('');
          this.showForm.set(false);
          this.refreshLessons$.next();
        }
      });
  }

  cancelLesson(lesson: Lesson): void {
    this.teacherService.cancelLesson(lesson.id).subscribe(() => this.refreshLessons$.next());
  }
}
