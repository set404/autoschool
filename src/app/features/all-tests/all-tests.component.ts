import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { ProgressService } from '../../core/services/progress.service';
import { LocalizePipe } from '../../core/services/localize.pipe';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent, IconName } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { TestSummary } from '../../core/models/test.model';
import { TestAttempt } from '../../core/models/attempt.model';

export type TestStatus = 'passed' | 'failed' | 'not-started';
type FilterOption = 'all' | TestStatus;

interface TestListItem {
  test: TestSummary;
  status: TestStatus;
  attempt?: TestAttempt;
}

const STATUS_ICON: Record<TestStatus, IconName> = {
  passed: 'check-circle',
  failed: 'x-circle',
  'not-started': 'play',
};

const STATUS_LABEL_KEY: Record<TestStatus, string> = {
  passed: 'allTests.passed',
  failed: 'allTests.failed',
  'not-started': 'allTests.notStarted',
};

@Component({
  selector: 'app-all-tests',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LocalizePipe, IconComponent, TopBarComponent],
  templateUrl: './all-tests.component.html',
  styleUrl: './all-tests.component.scss',
})
export class AllTestsComponent {
  private readonly dataService = inject(DataService);
  private readonly progress = inject(ProgressService);

  private readonly tests = toSignal(this.dataService.getTests(), { initialValue: [] });
  protected readonly filter = signal<FilterOption>('all');

  private readonly items = computed<TestListItem[]>(() => {
    const latestByTestId = new Map<string, TestAttempt>();
    for (const attempt of this.progress.attempts()) {
      if (!latestByTestId.has(attempt.testId)) {
        latestByTestId.set(attempt.testId, attempt);
      }
    }
    return this.tests().map((test) => {
      const attempt = latestByTestId.get(test.id);
      const status: TestStatus = !attempt ? 'not-started' : attempt.passed ? 'passed' : 'failed';
      return { test, status, attempt };
    });
  });

  protected readonly counts = computed(() => {
    const items = this.items();
    return {
      all: items.length,
      passed: items.filter((i) => i.status === 'passed').length,
      failed: items.filter((i) => i.status === 'failed').length,
      'not-started': items.filter((i) => i.status === 'not-started').length,
    };
  });

  protected readonly filteredItems = computed(() => {
    const filter = this.filter();
    const items = this.items();
    return filter === 'all' ? items : items.filter((i) => i.status === filter);
  });

  protected setFilter(filter: FilterOption): void {
    this.filter.set(filter);
  }

  protected statusIcon(status: TestStatus): IconName {
    return STATUS_ICON[status];
  }

  protected statusLabelKey(status: TestStatus): string {
    return STATUS_LABEL_KEY[status];
  }
}
