import { Injectable, signal } from '@angular/core';
import { DashboardStats } from './dashboard-api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private readonly _stats = signal<DashboardStats | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  readonly stats = this._stats.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  setStats(stats: DashboardStats): void {
    this._stats.set(stats);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }
}
