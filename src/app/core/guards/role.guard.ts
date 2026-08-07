import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

export function roleGuard(...allowedRoles: Role[]): CanActivateFn {
  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    await authService.waitUntilReady();

    const user = authService.currentUser();
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }
    return router.createUrlTree(['/']);
  };
}
