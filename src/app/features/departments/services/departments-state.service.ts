import { Injectable, signal } from '@angular/core';
import { Department } from '../models/department.model';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { DepartmentFilters } from '../models/department-filters.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentsStateService {
  private readonly _departments = signal<Department[]>([]);
  private readonly _totalCount = signal<number>(0);
  private readonly _pageNumber = signal<number>(1);
  private readonly _pageSize = signal<number>(5);
  private readonly _searchTerm = signal<string>('');
  private readonly _isLoading = signal<boolean>(false);
  private readonly _filters = signal<DepartmentFilters>({
    search: '',
  });

  readonly departments = this._departments.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly pageNumber = this._pageNumber.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly filters = this._filters.asReadonly();

  setPagedResult(result: PagedResult<Department>): void {
    this._departments.set(result.data);
    this._totalCount.set(result.totalCount);
    this._pageNumber.set(result.pageNumber);
    this._pageSize.set(result.pageSize);
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
    this._pageNumber.set(1);
  }

  setPageNumber(page: number): void {
    this._pageNumber.set(page);
  }

  setPageSize(size: number): void {
    this._pageSize.set(size);
    this._pageNumber.set(1); 
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setFilters(filters: DepartmentFilters): void {
    this._filters.set({ ...this._filters(), ...filters });
  }
}
