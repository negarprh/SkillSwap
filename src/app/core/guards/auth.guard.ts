import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notifications = inject(NotificationService);

  if (auth.isAuthenticated()) {
    return true;
  }

  notifications.info('Please sign in to access that page.');

  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url },
  });
};
