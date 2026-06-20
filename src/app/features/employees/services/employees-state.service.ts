import { Injectable, signal } from '@angular/core';
import { Employee, EmployeeDetail } from '../models/employee.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { EmployeeFilters } from '../models/employee-filters.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesStateService {
  private readonly _employees = signal<Employee[]>([]);
  private readonly _totalCount = signal<number>(0);
  private readonly _pageNumber = signal<number>(1);
  private readonly _pageSize = signal<number>(5);
  private readonly _searchTerm = signal<string>('');
  private readonly _isLoading = signal<boolean>(false);
  private readonly _filters = signal<EmployeeFilters>({
    search: '',
    departmentId: null,
    isActive: null,
  });
  private readonly _selectedEmployeeDetail = signal<EmployeeDetail | null>(null);
  private readonly _isDetailLoading = signal<boolean>(false);

  readonly employees = this._employees.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly pageNumber = this._pageNumber.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly selectedEmployeeDetail = this._selectedEmployeeDetail.asReadonly();
  readonly isDetailLoading = this._isDetailLoading.asReadonly();

  setPagedResult(result: PagedResult<Employee>): void {
    this._employees.set(result.data);
    this._totalCount.set(result.totalCount);
    this._pageNumber.set(result.pageNumber);
    this._pageSize.set(result.pageSize);
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
    this._pageNumber.set(1); // Reset page on new search
  }

  setPageNumber(page: number): void {
    this._pageNumber.set(page);
  }

  setPageSize(size: number): void {
    this._pageSize.set(size);
    this._pageNumber.set(1); // Reset page on size change
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setFilters(filters: EmployeeFilters): void {
    this._filters.set({ ...this._filters(), ...filters });
  }

  setSelectedEmployeeDetail(detail: EmployeeDetail | null): void {
    this._selectedEmployeeDetail.set(detail);
  }

  setDetailLoading(loading: boolean): void {
    this._isDetailLoading.set(loading);
  }
}
