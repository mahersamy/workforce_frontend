import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { Employee, EmployeeDetail, CreateEmployee, UpdateEmployee } from '../models/employee.model';
import { BACKEND_ROUTES } from '../../../core/constants/backend-route.const';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployeesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${BACKEND_ROUTES.EMPLOYEES}`;

  getEmployees(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
  ): Observable<PagedResult<Employee>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<PagedResult<Employee>>(this.baseUrl, { params });
  }

  getEmployeeById(id: number): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`${this.baseUrl}/${id}`);
  }

  createEmployee(dto: CreateEmployee): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, dto);
  }

  updateEmployee(id: number, dto: UpdateEmployee): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, dto);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
