import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TranslatePipe, IconComponent, TopBarComponent, LanguageSwitcherComponent, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  protected readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authService.currentUser;

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly uploading = signal(false);
  protected readonly avatarError = signal<string | null>(null);
  protected readonly avatarBroken = signal(false);
  private readonly avatarCacheBust = signal(0);

  protected readonly avatarSrc = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    return `${environment.apiUrl}${user.avatarUrl}?v=${this.avatarCacheBust()}`;
  });

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  openFilePicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.avatarError.set(null);

    if (!file.type.startsWith('image/')) {
      this.avatarError.set('profile.avatarInvalidType');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      this.avatarError.set('profile.avatarTooLarge');
      return;
    }

    this.uploading.set(true);
    this.authService
      .uploadAvatar(file)
      .pipe(
        catchError(() => {
          this.avatarError.set('profile.avatarUploadError');
          return of(null);
        }),
      )
      .subscribe((user) => {
        this.uploading.set(false);
        if (user) {
          this.avatarBroken.set(false);
          this.avatarCacheBust.update((n) => n + 1);
        }
      });
  }

  removeAvatar(): void {
    this.avatarError.set(null);
    this.authService
      .removeAvatar()
      .pipe(
        catchError(() => {
          this.avatarError.set('profile.avatarUploadError');
          return of(null);
        }),
      )
      .subscribe((user) => {
        if (user) {
          this.avatarBroken.set(true);
          this.avatarCacheBust.update((n) => n + 1);
        }
      });
  }

  onAvatarLoadError(): void {
    this.avatarBroken.set(true);
  }
}
