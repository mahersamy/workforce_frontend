import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentsFacadeService } from '../../services/departments-facade.service';
import { AuthFacadeService } from '../../../auth/services/auth-facade.service';
import { DepartmentFilters } from '../../models/department-filters.model';
import { ButtonModule } from 'primeng/button';
import { Department } from '../../models/department.model';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { DataTableConfig } from '../../../../shared/components/data-table/services/data-table-config';
import { TableColumnType } from '../../../../shared/components/data-table/enums/colmun-type.enum';
import { AppPaginator } from '../../../../shared/components/paginator/paginator';
import { FilterPanel } from '../../../../shared/components/filter-panel/filter-panel';
import { PageChangeEvent, PaginatorConfig } from '../../../../shared/components/paginator/models/pagination.model';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DepartmentDialogComponent } from '../department-dialog/department-dialog.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DataTable,
    AppPaginator,
    FilterPanel,
    ConfirmDialogModule,
    DepartmentDialogComponent
  ],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss'],
  providers: [DataTableConfig],
})
export class DepartmentListComponent implements OnInit {
  private readonly dataTableConfig = inject(DataTableConfig);
  private readonly deptFacade = inject(DepartmentsFacadeService);
  private readonly authFacade = inject(AuthFacadeService);
  private readonly confirmationService = inject(ConfirmationService);

  departments = this.deptFacade.departments;
  totalCount = this.deptFacade.totalCount;
  pageNumber = this.deptFacade.pageNumber;
  pageSize = this.deptFacade.pageSize;
  isLoading = this.deptFacade.isLoading;
  isAdmin = this.authFacade.isAdmin;
  isSubmitting = this.deptFacade.isSubmitting;

  // Dialog management
  isDialogOpen = signal<boolean>(false);
  selectedDepartment = signal<Department | null>(null);

  constructor() {
    this.initializeTable();
    this.initializeEffects();
  }

  ngOnInit(): void {
    this.deptFacade.loadDepartments();
  }

  // tableconfig

  private initializeTable(): void {
    this.configureColumns();
    this.configureActions();
    this.configureDataKey();
  }

  private configureColumns(): void {
    this.dataTableConfig.tableConfig.columns.set([
      { field: 'id', header: 'ID', sortable: true, type: TableColumnType.ID },
      { field: 'name', header: 'Department Name', sortable: true, type: TableColumnType.TEXT },
      { field: 'description', header: 'Description', type: TableColumnType.TEXT },
    ]);
  }

  private configureActions(): void {
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
  }

  private configureDataKey(): void {
    this.dataTableConfig.tableConfig.dataKey.set('id');
  }

  // effect
  private initializeEffects(): void {
    this.syncTableState();
  }

  private syncTableState(): void {
    effect(() => {
      this.dataTableConfig.tableConfig.rows.set(
        this.filteredDepartments()
      );

      this.dataTableConfig.tableConfig.loading.set(
        this.isLoading()
      );
    });
  }

  paginatorConfig = computed<PaginatorConfig>(() => ({
    totalCount: this.totalCount(),
    pageNumber: this.pageNumber(),
    pageSize: this.pageSize(),
    totalPages: Math.ceil(this.totalCount() / this.pageSize())
  }));

  filterConfig = computed(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
    },
  ]);

  filteredDepartments = computed(() => {
    const filters = this.deptFacade.filters();
    const list = this.departments() || [];

    return list.filter((dept) => {
      // Search: name, description (case insensitive)
      if (filters?.search && filters.search !== '') {
        const term = filters.search.toString().toLowerCase();
        const matches = [dept.name, dept.description]
          .filter((v): v is string => !!v)
          .some((v) => v.toLowerCase().includes(term));
        if (!matches) return false;
      }

      return true;
    });
  });

  // ── ScalableTable events ──────────────────────────────────────────────

  onSearch(value: string): void {
    this.deptFacade.setSearchTerm(value);
  }

  onPageChange(event: PageChangeEvent): void {
    if (this.pageSize() !== event.limit) {
      this.deptFacade.setPageSize(event.limit);
    }

    if (this.pageNumber() !== event.page) {
      this.deptFacade.setPage(event.page);
    }
  }

  onFiltersChanged(filters: Partial<DepartmentFilters>): void {
    this.deptFacade.setFilters(filters as DepartmentFilters);
  }

  // ── Dialog helpers ────────────────────────────────────────────────────

  openNewDialog(): void {
    this.selectedDepartment.set(null);
    this.isDialogOpen.set(true);
  }

  openEditDialog(dept: Department): void {
    this.selectedDepartment.set(dept);
    this.isDialogOpen.set(true);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────

  onDelete(id: number): void {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger'
      },

      accept: () => {
        this.deptFacade.deleteDepartment(id);
      },
    });

  }
}
