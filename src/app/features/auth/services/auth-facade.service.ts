import { Injectable, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthApiService } from './auth-api.service';
import { AuthStateService } from './auth-state.service';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.models';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AuthFacadeService {
  private readonly api = inject(AuthApiService);
  private readonly state = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);

  // Expose signals directly to components
  readonly isLoading = this.state.isLoading;
  readonly isAuthenticated = this.state.isAuthenticated;
  readonly error = this.state.error;

  readonly currentUser = this.state.user;
  readonly token = this.state.token;
  readonly userRole = this.state.userRole;
  readonly isAdmin = this.state.isAdmin;
  readonly isManager = this.state.isManager;
  readonly isEmployee = this.state.isEmployee;

  login(credentials: LoginRequest): void {
    this.state.setLoading(true);
    this.state.setError(null);

    this.api
      .login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: LoginResponse) => {
          this.state.setSession(res);
          this.state.setLoading(false);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.state.setError(error.error?.message || 'Login failed. Please check your credentials.');
          this.state.setLoading(false);
          this.state.clearSession();
        }
      });
  }

  register(request: RegisterRequest): void {
    this.state.setLoading(true);
    this.state.setError(null);

    this.api
      .register(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.state.setLoading(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Your account has been created successfully. You can now log in.',
            life: 5000
          });
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.state.setError(error.error?.message || 'Registration failed. Please try again.');
          this.state.setLoading(false);
        }
      });
  }

  logout(): void {
    this.state.reset();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.state.isAuthenticated();
  }
}
