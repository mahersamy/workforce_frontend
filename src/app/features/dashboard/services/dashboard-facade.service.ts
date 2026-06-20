import { DestroyRef, inject, Injectable } from '@angular/core';
import { finalize } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { DashboardStateService } from './dashboard-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class DashboardFacadeService {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly dashboardState = inject(DashboardStateService);
  private readonly destroyRef = inject(DestroyRef);


  readonly stats = this.dashboardState.stats;
  readonly isLoading = this.dashboardState.isLoading;


  loadStats(): void {
    this.dashboardState.setLoading(true);
    this.dashboardApi.getStats()
      .pipe(takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (stats) => {
          this.dashboardState.setStats(stats)
          this.dashboardState.setLoading(false)
        },
        error: () => {
          this.dashboardState.setLoading(false)
        }
      });
  }
}
