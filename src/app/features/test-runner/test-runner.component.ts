import { Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { LocalizePipe } from '../../core/services/localize.pipe';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { TestSessionService } from '../../core/services/test-session.service';
import { InfoModalComponent } from '../../shared/info-modal/info-modal.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { QuestionOption } from '../../core/models/question.model';
import { TestSummary } from '../../core/models/test.model';
import { MissedQuestionsService } from '../../core/services/missed-questions.service';
import { MISSED_TEST_DESCRIPTION, MISSED_TEST_ID, MISSED_TEST_TITLE } from '../../core/constants';

type OptionState = 'idle' | 'selected';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

@Component({
  selector: 'app-test-runner',
  standalone: true,
  imports: [
    TranslatePipe,
    LocalizePipe,
    InfoModalComponent,
    IconComponent,
    TopBarComponent,
  ],
  templateUrl: './test-runner.component.html',
  styleUrl: './test-runner.component.scss',
})
export class TestRunnerComponent {
  readonly id = input.required<string>();

  private readonly dataService = inject(DataService);
  private readonly missedQuestions = inject(MissedQuestionsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly session = inject(TestSessionService);
  protected readonly showInfo = signal(false);
  protected readonly optionLetters = OPTION_LETTERS;

  private readonly tick = signal(0);

  protected readonly questionNumber = computed(() => this.session.currentIndex() + 1);

  protected readonly remainingSeconds = computed(() => {
    this.tick();
    return Math.max(0, this.session.timeBudgetSeconds() - this.session.elapsedSeconds());
  });

  protected readonly clockLabel = computed(() => formatClock(this.remainingSeconds()));

  constructor() {
    effect(() => {
      const testId = this.id();
      // Only `id` should drive a reload — loadTest() also reads other signals
      // (e.g. the missed-questions pool) that must NOT become effect
      // dependencies, or updating them mid-session (finish() does) would
      // retrigger this effect and clobber the session we just finished.
      untracked(() => this.loadTest(testId));
    });

    const intervalId = setInterval(() => {
      this.tick.update((n) => n + 1);
      if (this.remainingSeconds() === 0 && this.session.totalQuestions() > 0) {
        this.finishTest();
      }
    }, 1000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  private loadTest(testId: string): void {
    if (testId === MISSED_TEST_ID) {
      this.loadMissedQuestionsTest();
      return;
    }
    this.dataService.getTest(testId).subscribe((test) => {
      if (!test) {
        this.router.navigateByUrl('/');
        return;
      }
      this.dataService.getQuestionsByIds(test.questionIds).subscribe((questions) => {
        this.session.start(test, questions);
        this.showInfo.set(false);
      });
    });
  }

  private loadMissedQuestionsTest(): void {
    const ids = this.missedQuestions.ids();
    if (ids.length === 0) {
      this.router.navigateByUrl('/statistics');
      return;
    }
    this.dataService.getQuestionsByIds(ids).subscribe((questions) => {
      if (questions.length === 0) {
        this.router.navigateByUrl('/statistics');
        return;
      }
      const syntheticTest: TestSummary = {
        id: MISSED_TEST_ID,
        title: MISSED_TEST_TITLE,
        description: MISSED_TEST_DESCRIPTION,
        questionIds: ids,
      };
      this.session.start(syntheticTest, questions);
      this.showInfo.set(false);
    });
  }

  optionState(option: QuestionOption): OptionState {
    const selected = this.session.selectedOptionId();
    return selected !== undefined && option.id === selected ? 'selected' : 'idle';
  }

  selectOption(optionId: string): void {
    this.session.selectOption(optionId);
  }

  toggleMark(): void {
    this.session.toggleMarkForReview();
  }

  openInfo(): void {
    if (this.session.isCurrentAnswered()) {
      this.showInfo.set(true);
    }
  }

  onPrevious(): void {
    this.showInfo.set(false);
    this.session.goPrevious();
  }

  onNext(): void {
    this.showInfo.set(false);
    if (this.session.isLastQuestion()) {
      if (this.session.allAnswered()) {
        this.finishTest();
      }
    } else {
      this.session.goNext();
    }
  }

  private finishTest(): void {
    this.session.finish();
    this.router.navigate(['/test', this.id(), 'ad']);
  }
}
