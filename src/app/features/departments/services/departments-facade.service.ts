import { inject, Injectable, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { DepartmentsApiService } from './departments-api.service';
import { DepartmentsStateService } from './departments-state.service';
import { MessageService } from 'primeng/api';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../models/department-dto.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentsFacadeService {
  private readonly deptState = inject(DepartmentsStateService);
  private readonly deptApi = inject(DepartmentsApiService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Paged list state (read-only) ──────────────────────────────────────
  readonly departments = this.deptState.departments;
  readonly totalCount = this.deptState.totalCount;
  readonly pageNumber = this.deptState.pageNumber;
  readonly pageSize = this.deptState.pageSize;
  readonly searchTerm = this.deptState.searchTerm;
  readonly filters = this.deptState.filters;
  readonly isLoading = this.deptState.isLoading;

  // ── Operation state (exposed to the view) ─────────────────────────────
  private readonly _isSubmitting = signal(false);
  private readonly _saveSucceeded = signal(0); // increments on each success

  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly saveSucceeded = this._saveSucceeded.asReadonly();

  // ── List actions ──────────────────────────────────────────────────────

  loadDepartments(): void {
    this.deptState.setLoading(true);
    this.deptApi
      .getDepartments(
        this.deptState.pageNumber(),
        this.deptState.pageSize(),
        this.deptState.searchTerm(),
      )
      .pipe(
        finalize(() => this.deptState.setLoading(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => this.deptState.setPagedResult(result),
        error: () => {},
      });
  }

  setSearchTerm(term: string): void {
    this.deptState.setSearchTerm(term);
    this.loadDepartments();
  }

  setPage(page: number): void {
    this.deptState.setPageNumber(page);
    this.loadDepartments();
  }

  setPageSize(size: number): void {
    this.deptState.setPageSize(size);
    this.loadDepartments();
  }

  setFilters(filters: import('../models/department-filters.model').DepartmentFilters): void {
    this.deptState.setFilters(filters);
  }

  // ── CRUD — facade owns the subscription ───────────────────────────────


  saveDepartment(
    isEdit: boolean,
    id: number | null,
    dto: CreateDepartmentDto | UpdateDepartmentDto,
  ): void {
    this._isSubmitting.set(true);

    const request$ =
      isEdit && id !== null
        ? this.deptApi.updateDepartment(id, dto as UpdateDepartmentDto)
        : this.deptApi.createDepartment(dto as CreateDepartmentDto);

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
            detail: isEdit ? 'Department updated successfully' : 'Department created successfully',
          });
          this.loadDepartments();
          this._saveSucceeded.update((v) => v + 1);
        },
        error: () => {},
      });
  }


  deleteDepartment(id: number): void {
    this.deptApi
      .deleteDepartment(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Department deleted successfully',
          });
          this.loadDepartments();
        },
        error: () => {},
      });
  }
}
