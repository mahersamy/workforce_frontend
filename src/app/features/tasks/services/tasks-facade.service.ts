import { inject, Injectable, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TasksStateService } from './tasks-state.service';
import { MessageService } from 'primeng/api';
import { TasksApiService } from './tasks-api.service';
import { CreateTaskDto, UpdateTaskDto } from '../models/task-dto.model';
import { TaskFilters } from '../models/task-filters.model';

@Injectable({
  providedIn: 'root',
})
export class TasksFacadeService {
  private readonly taskApi = inject(TasksApiService);
  private readonly taskState = inject(TasksStateService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Paged list state (read-only) ──────────────────────────────────────
  readonly tasks = this.taskState.tasks;
  readonly totalCount = this.taskState.totalCount;
  readonly pageNumber = this.taskState.pageNumber;
  readonly pageSize = this.taskState.pageSize;
  readonly searchTerm = this.taskState.searchTerm;
  readonly filters = this.taskState.filters;
  readonly isLoading = this.taskState.isLoading;

  // ── Operation state ────────────────────────────────────────────────────
  private readonly _isSubmitting = signal(false);
  private readonly _saveSucceeded = signal(0);

  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly saveSucceeded = this._saveSucceeded.asReadonly();

  // ── List actions ──────────────────────────────────────────────────────

  loadTasks(): void {
    this.taskState.setLoading(true);
    this.taskApi
      .getTasks(this.taskState.pageNumber(), this.taskState.pageSize(), this.taskState.searchTerm())
      .pipe(
        finalize(() => this.taskState.setLoading(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => this.taskState.setPagedResult(result),
        error: () => {},
      });
  }

  setSearchTerm(term: string): void {
    this.taskState.setSearchTerm(term);
    this.loadTasks();
  }

  setPage(page: number): void {
    this.taskState.setPageNumber(page);
    this.loadTasks();
  }

  setPageSize(size: number): void {
    this.taskState.setPageSize(size);
    this.loadTasks();
  }

  setFilters(filters: TaskFilters): void {
    this.taskState.setFilters(filters);
  }

  // ── CRUD — facade owns the subscription ───────────────────────────────

  /** Creates or updates a task. Increments saveSucceeded on success. */
  saveTask(isEdit: boolean, id: number | null, dto: CreateTaskDto | UpdateTaskDto): void {
    this._isSubmitting.set(true);

    const request$ =
      isEdit && id !== null
        ? this.taskApi.updateTask(id, dto as UpdateTaskDto)
        : this.taskApi.createTask(dto as CreateTaskDto);

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
            detail: isEdit ? 'Task updated successfully' : 'Task created and assigned successfully',
          });
          this.loadTasks();
          this._saveSucceeded.update((v) => v + 1);
        },
        error: () => {},
      });
  }

  updateTaskStatus(id: number, status: number): void {
    this.taskApi
      .updateTaskStatus(id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task status updated successfully',
          });
          this.loadTasks();
        },
        error: () => {},
      });
  }

  /** Fire-and-forget delete. */
  deleteTask(id: number): void {
    this.taskApi
      .deleteTask(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task deleted successfully',
          });
          this.loadTasks();
        },
        error: () => {},
      });
  }
}
