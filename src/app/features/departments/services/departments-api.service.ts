import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../models/department.model';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../models/department-dto.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';
import { BACKEND_ROUTES } from '../../../core/constants/backend-route.const';

@Injectable({
  providedIn: 'root',
})
export class DepartmentsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${BACKEND_ROUTES.DEPARTMENTS}`;


  getDepartments(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
  ): Observable<PagedResult<Department>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<PagedResult<Department>>(this.baseUrl, { params });
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/${id}`);
  }

  createDepartment(dto: CreateDepartmentDto): Observable<Department> {
    return this.http.post<Department>(this.baseUrl, dto);
  }

  updateDepartment(id: number, dto: UpdateDepartmentDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, dto);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
