import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { LocalizePipe } from '../../core/services/localize.pipe';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { ProgressService } from '../../core/services/progress.service';
import { AuthService } from '../../core/services/auth.service';

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

  readonly tests = this.dataService.tests;

  protected readonly firstName = computed(() => this.authService.currentUser()?.name.split(' ')[0] ?? '');

  protected readonly lessonsCompleted = 12;
  protected readonly lessonsTotal = 20;

  protected readonly recentTests = computed(() => this.progress.attempts().slice(0, 3));
  protected readonly skeletonRows = [0, 1, 2];

  protected get firstTestId(): string | undefined {
    return this.tests()[0]?.id;
  }
}
