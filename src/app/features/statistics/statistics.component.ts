import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { LocalizePipe } from '../../core/services/localize.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { ProgressService } from '../../core/services/progress.service';
import { MissedQuestionsService } from '../../core/services/missed-questions.service';
import { DataService } from '../../core/services/data.service';
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
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent {
  protected readonly progress = inject(ProgressService);
  protected readonly missedQuestionsService = inject(MissedQuestionsService);
  private readonly dataService = inject(DataService);

  protected readonly missedTestRoute = ['/test', MISSED_TEST_ID];
  protected readonly recentAttempts = this.progress.attempts;

  private readonly allQuestions = toSignal(this.dataService.getAllQuestions(), { initialValue: [] });

  protected readonly missedQuestionList = computed(() => {
    const ids = new Set(this.missedQuestionsService.ids());
    return this.allQuestions().filter((q) => ids.has(q.id));
  });
}
