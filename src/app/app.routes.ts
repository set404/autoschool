import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'tests',
    loadComponent: () =>
      import('./features/all-tests/all-tests.component').then((m) => m.AllTestsComponent),
  },
  {
    path: 'lessons',
    loadComponent: () => import('./features/lessons/lessons.component').then((m) => m.LessonsComponent),
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./features/statistics/statistics.component').then((m) => m.StatisticsComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'test/:id/results',
    loadComponent: () =>
      import('./features/results/results.component').then((m) => m.ResultsComponent),
  },
  {
    path: 'test/:id/ad',
    loadComponent: () =>
      import('./features/test-complete-ad/test-complete-ad.component').then(
        (m) => m.TestCompleteAdComponent,
      ),
  },
  {
    path: 'test/:id/review',
    loadComponent: () =>
      import('./features/review-answers/review-answers.component').then(
        (m) => m.ReviewAnswersComponent,
      ),
  },
  {
    path: 'test/:id',
    loadComponent: () =>
      import('./features/test-runner/test-runner.component').then((m) => m.TestRunnerComponent),
  },
  { path: '**', redirectTo: '' },
];
