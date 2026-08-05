import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { LocalizePipe } from '../../core/services/localize.pipe';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { ProgressService } from '../../core/services/progress.service';

interface LearningModule {
  titleKey: string;
  descriptionKey: string;
  accent: string;
}

const LEARNING_MODULES: LearningModule[] = [
  { titleKey: 'lessons.topic.roadSigns.title', descriptionKey: 'dashboard.module.roadSigns', accent: 'navy' },
  { titleKey: 'lessons.topic.rightOfWay.title', descriptionKey: 'dashboard.module.rightOfWay', accent: 'amber' },
  { titleKey: 'lessons.topic.nightDriving.title', descriptionKey: 'dashboard.module.nightDriving', accent: 'slate' },
  { titleKey: 'lessons.topic.vehicleBasics.title', descriptionKey: 'dashboard.module.vehicleBasics', accent: 'navy' },
];

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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly dataService = inject(DataService);
  protected readonly progress = inject(ProgressService);

  readonly tests = toSignal(this.dataService.getTests(), { initialValue: [] });

  protected readonly lessonsCompleted = 12;
  protected readonly lessonsTotal = 20;

  protected readonly recentTests = computed(() => this.progress.attempts().slice(0, 3));
  protected readonly modules = LEARNING_MODULES;

  protected get firstTestId(): string | undefined {
    return this.tests()[0]?.id;
  }
}
