import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_ROUTES } from '../../../core/constants/backend-route.const';
import { environment } from '../../../../environments/environment';

export interface TaskStatusStat {
  status: string;
  count: number;
}

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  tasksByStatus: TaskStatusStat[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${BACKEND_ROUTES.DASHBOARD}`;


  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }
}
