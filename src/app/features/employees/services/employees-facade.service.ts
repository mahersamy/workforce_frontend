import { inject, Injectable, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import {
  EmployeesApiService,
} from './employees-api.service';
import { EmployeesStateService } from './employees-state.service';
import { MessageService } from 'primeng/api';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee-dto.model';
import { CreateEmployee, EmployeeDetail, UpdateEmployee } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesFacadeService {
  private readonly empApi = inject(EmployeesApiService);
  private readonly empState = inject(EmployeesStateService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Paged list state (read-only) ──────────────────────────────────────
  readonly employees = this.empState.employees;
  readonly totalCount = this.empState.totalCount;
  readonly pageNumber = this.empState.pageNumber;
  readonly pageSize = this.empState.pageSize;
  readonly searchTerm = this.empState.searchTerm;
  readonly filters = this.empState.filters;
  readonly isLoading = this.empState.isLoading;

  readonly selectedEmployeeDetail = this.empState.selectedEmployeeDetail;
  readonly isDetailLoading = this.empState.isDetailLoading;

  // ── Operation state ────────────────────────────────────────────────────
  private readonly _isSubmitting = signal(false);
  private readonly _saveSucceeded = signal(0);

  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly saveSucceeded = this._saveSucceeded.asReadonly();

  // ── List actions ──────────────────────────────────────────────────────

  loadEmployees(): void {
    this.empState.setLoading(true);
    this.empApi
      .getEmployees(
        this.empState.pageNumber(),
        this.empState.pageSize(),
        this.empState.searchTerm(),
      )
      .pipe(
        finalize(() => this.empState.setLoading(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => this.empState.setPagedResult(result),
        error: () => { },
      });
  }

  setSearchTerm(term: string): void {
    this.empState.setSearchTerm(term);
    this.loadEmployees();
  }

  setPage(page: number): void {
    this.empState.setPageNumber(page);
    this.loadEmployees();
  }

  setPageSize(size: number): void {
    this.empState.setPageSize(size);
    this.loadEmployees();
  }

  setFilters(filters: import('../models/employee-filters.model').EmployeeFilters): void {
    this.empState.setFilters(filters);
  }

  /**
   * Loads the employee detail and populates it in the state.
   * This removes the need for the component to subscribe directly.
   */
  loadEmployeeDetails(id: number): void {
    this.empState.setDetailLoading(true);
    this.empApi.getEmployeeById(id)
      .pipe(
        finalize(() => this.empState.setDetailLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (detail) => this.empState.setSelectedEmployeeDetail(detail),
        error: () => this.empState.setSelectedEmployeeDetail(null)
      });
  }

  clearEmployeeDetails(): void {
    this.empState.setSelectedEmployeeDetail(null);
  }

  saveEmployee(
    isEdit: boolean,
    id: number | null,
    dto: CreateEmployeeDto | UpdateEmployeeDto,
  ): void {
    this._isSubmitting.set(true);

    const request$ =
      isEdit && id !== null
        ? this.empApi.updateEmployee(id, dto as UpdateEmployee)
        : this.empApi.createEmployee(dto as CreateEmployee);

    request$
      .pipe(
        finalize(() => this._isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: isEdit ? 'Employee updated successfully' : 'Employee created successfully',
          });
          this.loadEmployees();
          this._saveSucceeded.update((v) => v + 1);
        },
        error: () => { },
      });
  }

  /** Fire-and-forget delete — no subscription in the component. */
  deleteEmployee(id: number): void {
    this.empApi
      .deleteEmployee(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Employee soft-deleted successfully',
          });
          this.loadEmployees();
        },
        error: () => { },
      });
  }
}
