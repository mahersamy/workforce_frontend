import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthFacadeService } from '../../features/auth/services/auth-facade.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authFacade = inject(AuthFacadeService);
  const router = inject(Router);

  if (authFacade.isAuthenticated()) {
    return true;
  }

  // Not logged in, redirect to login page with the return URL
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authFacade = inject(AuthFacadeService);
  const router = inject(Router);

  if (authFacade.isAuthenticated()) {
    // Already logged in, redirect to dashboard
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
