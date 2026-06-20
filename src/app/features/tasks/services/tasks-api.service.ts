import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { Task } from '../models/task.model';
import { CreateTaskDto, UpdateTaskDto } from '../models/task-dto.model';
import { BACKEND_ROUTES } from '../../../core/constants/backend-route.const';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${BACKEND_ROUTES.TASKS}`;

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  getTasks(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
  ): Observable<PagedResult<Task>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<PagedResult<Task>>(this.baseUrl, { params });
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, dto);
  }

  updateTask(id: number, dto: UpdateTaskDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, dto);
  }

  updateTaskStatus(id: number, status: number): Observable<any> {
    // Note: the body is just raw integer content representing status enum
    return this.http.patch<any>(`${this.baseUrl}/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
