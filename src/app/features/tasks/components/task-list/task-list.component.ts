import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksFacadeService } from '../../services/tasks-facade.service';
import { EmployeesFacadeService } from '../../../employees/services/employees-facade.service';
import { AuthFacadeService } from '../../../auth/services/auth-facade.service';
import { TaskFilters } from '../../models/task-filters.model';
import { ButtonModule } from 'primeng/button';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { DataTableConfig } from '../../../../shared/components/data-table/services/data-table-config';
import { TableColumnType } from '../../../../shared/components/data-table/enums/colmun-type.enum';
import { AppPaginator } from '../../../../shared/components/paginator/paginator';
import { FilterPanel } from '../../../../shared/components/filter-panel/filter-panel';
import { Task } from '../../models/task.model';
import { PageChangeEvent, PaginatorConfig } from '../../../../shared/components/paginator/models/pagination.model';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { StatusBadgeOption } from '../../../../shared/components/data-table/models/colmun-config.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DataTable,
    AppPaginator,
    FilterPanel,
    TaskDialogComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  providers: [DataTableConfig],
})
export class TaskListComponent implements OnInit {
  private readonly dataTableConfig = inject(DataTableConfig);
  private readonly tasksFacade = inject(TasksFacadeService);
  private readonly empFacade = inject(EmployeesFacadeService);
  private readonly authFacade = inject(AuthFacadeService);

  tasks = this.tasksFacade.tasks;
  totalCount = this.tasksFacade.totalCount;
  pageNumber = this.tasksFacade.pageNumber;
  pageSize = this.tasksFacade.pageSize;
  isLoading = this.tasksFacade.isLoading;
  isAdmin = this.authFacade.isAdmin;
  isManager = this.authFacade.isManager;
  currentUser = this.authFacade.currentUser;

  paginatorConfig = computed<PaginatorConfig>(() => ({
    totalCount: this.totalCount(),
    pageNumber: this.pageNumber(),
    pageSize: this.pageSize(),
    totalPages: Math.ceil(this.totalCount() / this.pageSize())
  }));
  employees = this.empFacade.employees;

  filterConfig = computed(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      options: this.priorityBadgeOptions,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: this.statusBadgeOptions,
    },
    {
      key: 'assignedToEmployeeId',
      label: 'Assigned To',
      type: 'select',
      options: this.employees().map((e) => ({
        label: `${e.firstName} ${e.lastName}`,
        value: e.id,
      })),
    },
  ]);

  filteredTasks = computed(() => {
    const filters = this.tasksFacade.filters();
    const list = this.tasks() || [];

    return list.filter((task) => {
      // Search: title, description
      if (filters?.search && filters.search !== '') {
        const term = filters.search.toString().toLowerCase();
        const matches = [task.title, task.description]
          .filter((v): v is string => !!v)
          .some((v) => v.toLowerCase().includes(term));
        if (!matches) return false;
      }

      // Priority
      if (filters?.priority != null && typeof filters.priority === 'number') {
        const taskPriority = this.getPriorityValue(task.priority);
        if (taskPriority !== filters.priority) return false;
      }

      // Status
      if (filters?.status != null && typeof filters.status === 'number') {
        const taskStatus = this.getStatusValue(task.status);
        if (taskStatus !== filters.status) return false;
      }

      // Assigned To Employee
      if (filters?.assignedToEmployeeId != null) {
        if (task.assignedToEmployeeId !== filters.assignedToEmployeeId) return false;
      }

      return true;
    });
  });



  // Dialogs
  isFormOpen = signal<boolean>(false);
  selectedTask = signal<Task | null>(null);

  constructor() {
    this.initializeTable();
    this.initializeEffects();
  }

  ngOnInit(): void {
    this.tasksFacade.loadTasks();
    this.empFacade.setPageSize(100);
  }

  priorityBadgeOptions: StatusBadgeOption[] = [
  { label: 'Low', value: 0, severity: 'secondary' },
  { label: 'Medium', value: 1, severity: 'info' },
  { label: 'High', value: 2, severity: 'warning' },
  { label: 'Critical', value: 3, severity: 'danger' },
];

statusBadgeOptions: StatusBadgeOption[] = [
  { label: 'Pending', value: 0, severity: 'warning' },
  { label: 'InProgress', value: 1, severity: 'info' },
  { label: 'Completed', value: 2, severity: 'success' },
  { label: 'Cancelled', value: 3, severity: 'danger' },
];

  private initializeTable(): void {
    this.dataTableConfig.tableConfig.columns.set([
      { field: 'id', header: 'ID', sortable: true, type: TableColumnType.ID },
      { field: 'title', header: 'Title', sortable: true, type: TableColumnType.TEXT },
      { field: 'dueDate', header: 'Due Date', type: TableColumnType.DATE, dateFormat: 'MMM d, y' },
      { field: 'priority', header: 'Priority', type: TableColumnType.TEXT },
      { field: 'status', header: 'Status', type: TableColumnType.TEXT },
      { field: 'assignedToEmployeeId', header: 'Assigned To', type: TableColumnType.TEXT },
 {
      field: 'priority',
      header: 'Priority',
      type: TableColumnType.STATUS,
      options: this.priorityBadgeOptions,
      editable: false,
    },
    {
      field: 'status',
      header: 'Status',
      type: TableColumnType.STATUS,
      options: this.statusBadgeOptions,
      isEditable: (row: Task) => this.canUpdateStatus(row),
      onChange: (value: number, row: Task) => this.onStatusChange(row, value),
    },
    ]);

    this.dataTableConfig.tableConfig.actions.set([
      {
        icon: 'pi pi-pencil',
        classes: 'p-button-rounded p-button-text p-button-info',
        func: (row) => this.openEditDialog(row),
      },
      {
        icon: 'pi pi-trash',
        classes: 'p-button-rounded p-button-text p-button-danger',
        func: (row) => this.onDelete(row.id),
      },
    ]);

    this.dataTableConfig.tableConfig.dataKey.set('id');
  }

  private initializeEffects(): void {
    effect(() => {
      this.dataTableConfig.tableConfig.rows.set(this.filteredTasks());
      this.dataTableConfig.tableConfig.loading.set(this.isLoading());
    });
  }

  // ── ScalableTable events ──────────────────────────────────────────────

  onSearch(value: string): void {
    this.tasksFacade.setSearchTerm(value);
  }

  onPageChange(event: PageChangeEvent): void {
    if (this.pageSize() !== event.limit) {
      this.tasksFacade.setPageSize(event.limit);
    }

    if (this.pageNumber() !== event.page) {
      this.tasksFacade.setPage(event.page);
    }
  }

  onFiltersChanged(filters: Partial<TaskFilters>): void {
    this.tasksFacade.setFilters(filters as TaskFilters);
  }

  // ── Priority / Status helpers ─────────────────────────────────────────

  getStatusValue(label: string): number {
    switch (label) {
      case 'Pending':
        return 0;
      case 'InProgress':
      case 'In Progress':
        return 1;
      case 'Completed':
        return 2;
      case 'Cancelled':
        return 3;
      default:
        return 0;
    }
  }

  getPriorityValue(label: string): number {
    switch (label) {
      case 'Low':
        return 0;
      case 'Medium':
        return 1;
      case 'High':
        return 2;
      case 'Critical':
        return 3;
      default:
        return 1;
    }
  }

  canUpdateStatus(task: Task): boolean {
    if (this.isManager()) return true;
    const profile = this.currentUser();
    return !!(profile && profile.employeeId === task.assignedToEmployeeId);
  }

  // ── Dialog helpers ────────────────────────────────────────────────────

  openNewDialog(): void {
    this.selectedTask.set(null);
    this.isFormOpen.set(true);
  }

  openEditDialog(task: Task): void {
    this.selectedTask.set(task);
    this.isFormOpen.set(true);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────

  onStatusChange(task: Task, newStatusValue: number): void {
    this.tasksFacade.updateTaskStatus(task.id, newStatusValue);
  }

  onDelete(id: number): void {
    this.tasksFacade.deleteTask(id);
  }
}
