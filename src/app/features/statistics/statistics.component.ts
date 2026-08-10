import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { LocalizePipe } from '../../core/services/localize.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { AttemptCommentsComponent } from '../../shared/attempt-comments/attempt-comments.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { ProgressService } from '../../core/services/progress.service';
import { MissedQuestionsService } from '../../core/services/missed-questions.service';
import { MISSED_TEST_ID } from '../../core/constants';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    TranslatePipe,
    LocalizePipe,
    IconComponent,
    TopBarComponent,
    AttemptCommentsComponent,
    SkeletonComponent,
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent {
  protected readonly progress = inject(ProgressService);
  protected readonly missedQuestionsService = inject(MissedQuestionsService);

  protected readonly missedTestRoute = ['/test', MISSED_TEST_ID];
  protected readonly recentAttempts = this.progress.attempts;
  protected readonly missedQuestionList = this.missedQuestionsService.questions;
  protected readonly skeletonRows = [0, 1, 2];

  protected readonly expandedAttemptId = signal<string | null>(null);

  toggleAttempt(attemptId: string): void {
    this.expandedAttemptId.set(this.expandedAttemptId() === attemptId ? null : attemptId);
  }
}
