import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from '../../features/auth/services/auth-state.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authState = inject(AuthStateService);
  const token = authState.token();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
