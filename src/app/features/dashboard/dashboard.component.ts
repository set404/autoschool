import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { LocalizePipe } from '../../core/services/localize.pipe';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { ProgressService } from '../../core/services/progress.service';
import { AuthService } from '../../core/services/auth.service';
import { LessonsService } from '../../core/services/lessons.service';
import { Lesson } from '../../core/models/lesson.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    TranslatePipe,
    LocalizePipe,
    IconComponent,
    TopBarComponent,
    SkeletonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly dataService = inject(DataService);
  protected readonly progress = inject(ProgressService);
  private readonly authService = inject(AuthService);
  private readonly lessonsService = inject(LessonsService);

  readonly tests = this.dataService.tests;

  protected readonly firstName = computed(() => this.authService.currentUser()?.name.split(' ')[0] ?? '');

  protected readonly lessonsLoading = signal(true);
  protected readonly lessons = toSignal(
    this.lessonsService.list().pipe(
      catchError(() => of([] as Lesson[])),
      tap(() => this.lessonsLoading.set(false)),
    ),
    { initialValue: [] as Lesson[] },
  );

  protected readonly upcomingLessons = computed(() =>
    this.lessons()
      .filter((l) => l.status === 'SCHEDULED' && l.scheduledAt >= Date.now())
      .sort((a, b) => a.scheduledAt - b.scheduledAt),
  );

  protected readonly upcomingLessonsPreview = computed(() => this.upcomingLessons().slice(0, 3));

  protected readonly recentTests = computed(() => this.progress.attempts().slice(0, 3));
  protected readonly skeletonRows = [0, 1, 2];

  protected get firstTestId(): string | undefined {
    return this.tests()[0]?.id;
  }
}
