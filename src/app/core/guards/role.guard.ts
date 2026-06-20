import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthFacadeService } from '../../features/auth/services/auth-facade.service';
import { MessageService } from 'primeng/api';

export const roleGuard: CanActivateFn = (route, state) => {
  const authFacade = inject(AuthFacadeService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  const expectedRoles = route.data['expectedRoles'] as string[];
  const userRole = authFacade.userRole();

  if (authFacade.isAuthenticated() && userRole && expectedRoles.includes(userRole)) {
    return true;
  }

  // User role is not allowed, show warning and redirect to dashboard
  messageService.add({
    severity: 'warn',
    summary: 'Access Denied',
    detail: 'You do not have permission to access this page.',
    life: 5000
  });

  return router.createUrlTree(['/dashboard']);
};
