import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { LOCALSTORAGE_KEY } from '../../../core/constants/localstorage-key.const';
import { LoginResponse, UserProfile } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly _token = signal<string | null>(null);
  private readonly _user = signal<UserProfile | null>(null);

  private _isAuthenticated = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly userRole = computed(() => this._user()?.role || null);
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');
  readonly isManager = computed(
    () => this._user()?.role === 'Manager' || this._user()?.role === 'Admin',
  );
  readonly isEmployee = computed(() => this._user()?.role === 'Employee');

  constructor(private storageService: StorageService) {
    this.loadSession();
  }

  setAuthenticated(value: boolean): void {
    this._isAuthenticated.set(value);
  }

  setLoading(value: boolean): void {
    this._isLoading.set(value);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  setSession(session: LoginResponse): void {
    this._token.set(session.token);
    this._isAuthenticated.set(true);
    const profile: UserProfile = {
      userId: session.userId,
      username: session.username,
      role: session.role,
      employeeId: session.employeeId,
    };
    this._user.set(profile);

    this.storageService.setItem(LOCALSTORAGE_KEY.AUTH_TOKEN, session.token);
    this.storageService.setItem(LOCALSTORAGE_KEY.USER_PROFILE, JSON.stringify(profile));
  }

  clearSession(): void {
    this._token.set(null);
    this._user.set(null);
    this._isAuthenticated.set(false);
    this._isLoading.set(false);
    this._error.set(null);
    this.storageService.removeItem(LOCALSTORAGE_KEY.AUTH_TOKEN);
    this.storageService.removeItem(LOCALSTORAGE_KEY.USER_PROFILE);
  }

  reset(): void {
    this.clearSession();
  }

  private loadSession(): void {
    const token = this.storageService.getItem(LOCALSTORAGE_KEY.AUTH_TOKEN);
    const userJson = this.storageService.getItem(LOCALSTORAGE_KEY.USER_PROFILE);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserProfile;
        this._token.set(token);
        this._user.set(user);
        this._isAuthenticated.set(true);
      } catch {
        this.clearSession();
      }
    }
  }
}
