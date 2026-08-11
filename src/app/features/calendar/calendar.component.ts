import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { LessonsService } from '../../core/services/lessons.service';
import { AuthService } from '../../core/services/auth.service';
import { Lesson } from '../../core/models/lesson.model';

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
  selector: 'app-calendar',
  standalone: true,
  imports: [DatePipe, TranslatePipe, IconComponent, TopBarComponent, SkeletonComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  private readonly lessonsService = inject(LessonsService);

  protected readonly skeletonRows = [0, 1, 2];
  protected readonly loading = signal(true);

  constructor() {
    const authService = inject(AuthService);
    const router = inject(Router);
    // Teachers manage lessons on their own dedicated page; this page is the student-facing read-only view.
    if (authService.currentUser()?.role === 'TEACHER') {
      router.navigate(['/teacher/lessons']);
    }
  }

  protected readonly lessons = toSignal(
    this.lessonsService.list().pipe(
      catchError(() => of([] as Lesson[])),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] as Lesson[] },
  );

  protected readonly upcoming = computed(() =>
    this.lessons()
      .filter((l) => l.status === 'SCHEDULED' && l.scheduledAt >= Date.now())
      .sort((a, b) => a.scheduledAt - b.scheduledAt),
  );

  protected readonly past = computed(() =>
    this.lessons()
      .filter((l) => l.status !== 'SCHEDULED' || l.scheduledAt < Date.now())
      .sort((a, b) => b.scheduledAt - a.scheduledAt),
  );

  protected readonly upcomingGroups = computed(() => groupByDay(this.upcoming()));
  protected readonly pastGroups = computed(() => groupByDay(this.past()));
}
