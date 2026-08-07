import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { TranslatePipe } from '../../../core/services/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: '../auth-form.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (this.submitting()) return;
    this.errorMessage.set(null);
    this.submitting.set(true);

    this.authService
      .login({ email: this.email().trim(), password: this.password() })
      .pipe(
        catchError(() => {
          this.errorMessage.set('auth.loginError');
          return of(null);
        }),
      )
      .subscribe((result) => {
        this.submitting.set(false);
        if (result) {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
          this.router.navigateByUrl(returnUrl);
        }
      });
  }
}
