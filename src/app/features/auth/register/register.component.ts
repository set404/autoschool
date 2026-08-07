import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '../../../core/services/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: '../auth-form.scss',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (this.submitting()) return;
    this.errorMessage.set(null);
    this.submitting.set(true);

    this.authService
      .register({ name: this.name().trim(), email: this.email().trim(), password: this.password() })
      .pipe(
        catchError((err: unknown) => {
          const conflict = err instanceof HttpErrorResponse && err.status === 409;
          this.errorMessage.set(conflict ? 'auth.emailTaken' : 'auth.registerError');
          return of(null);
        }),
      )
      .subscribe((result) => {
        this.submitting.set(false);
        if (result) {
          this.router.navigateByUrl('/');
        }
      });
  }
}
