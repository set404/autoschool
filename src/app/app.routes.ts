import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
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
        path: 'statistics',
        loadComponent: () =>
          import('./features/statistics/statistics.component').then((m) => m.StatisticsComponent),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/calendar.component').then((m) => m.CalendarComponent),
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
      {
        path: 'teacher',
        canActivate: [roleGuard('TEACHER')],
        loadComponent: () =>
          import('./features/teacher/teacher-dashboard/teacher-dashboard.component').then(
            (m) => m.TeacherDashboardComponent,
          ),
      },
      {
        path: 'teacher/lessons',
        canActivate: [roleGuard('TEACHER')],
        loadComponent: () =>
          import('./features/teacher/teacher-lessons/teacher-lessons.component').then(
            (m) => m.TeacherLessonsComponent,
          ),
      },
      {
        path: 'admin',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
