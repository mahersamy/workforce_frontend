import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeesFacadeService } from '../../services/employees-facade.service';
import { DepartmentsFacadeService } from '../../../departments/services/departments-facade.service';
import { AuthFacadeService } from '../../../auth/services/auth-facade.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Employee, EmployeeDetail } from '../../models/employee.model';
import { EmployeeFilters } from '../../models/employee-filters.model';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { DataTableConfig } from '../../../../shared/components/data-table/services/data-table-config';
import { TableColumnType } from '../../../../shared/components/data-table/enums/colmun-type.enum';
import { AppPaginator } from '../../../../shared/components/paginator/paginator';
import { FilterPanel } from '../../../../shared/components/filter-panel/filter-panel';
import { PageChangeEvent, PaginatorConfig } from '../../../../shared/components/paginator/models/pagination.model';
import { EmployeeDialogComponent } from '../employee-dialog/employee-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    ProgressSpinnerModule,
    DataTable,
    AppPaginator,
    FilterPanel,
    EmployeeDialogComponent,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  providers: [DataTableConfig],
})
export class EmployeeListComponent implements OnInit {
  private readonly dataTableConfig = inject(DataTableConfig);
  private readonly empFacade = inject(EmployeesFacadeService);
  private readonly deptFacade = inject(DepartmentsFacadeService);
  private readonly authFacade = inject(AuthFacadeService);

  employees = this.empFacade.employees;
  totalCount = this.empFacade.totalCount;
  pageNumber = this.empFacade.pageNumber;
  pageSize = this.empFacade.pageSize;
  isLoading = this.empFacade.isLoading;
  isAdmin = this.authFacade.isAdmin;
  isManager = this.authFacade.isManager;
  departments = this.deptFacade.departments;

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
    {
      key: 'departmentId',
      label: 'Department',
      type: 'select',
      options: this.departments().map((d) => ({ label: d.name, value: d.id })),
    },
  ]);

  filteredEmployees = computed(() => {
    const filters = this.empFacade.filters();
    const list = Array.from(this.employees());
    return list.filter((emp) => {
      // Search: firstName, lastName, email (case insensitive)
      if (filters?.search && filters.search !== '') {
        const term = filters.search.toString().toLowerCase();
        const matches = [emp.firstName, emp.lastName, emp.email]
          .filter(Boolean)
          .some((v) => v.toString().toLowerCase().includes(term));
        if (!matches) return false;
      }

      // Department: EmployeeDto contains `departmentName`, not `departmentId`.
      if (filters?.departmentId != null) {
        const dept = this.departments().find((d) => d.id === filters.departmentId);
        const deptName = dept ? dept.name : null;
        if (deptName == null) return false;
        if (emp.departmentName !== deptName) return false;
      }

      // Status: filter by isActive (true/false, not null)
      if (filters?.isActive != null && typeof filters.isActive === 'boolean') {
        if (emp.isActive !== filters.isActive) return false;
      }

      return true;
    });
  });

  // Dialog management
  isFormOpen = signal<boolean>(false);
  isDetailOpen = signal<boolean>(false);
  selectedEmployee = signal<Employee | null>(null);
  employeeDetail = this.empFacade.selectedEmployeeDetail;
  isLoadingDetail = this.empFacade.isDetailLoading;

  constructor() {
    this.initializeTable();
    this.initializeEffects();
  }

  ngOnInit(): void {
    this.empFacade.loadEmployees();
    this.deptFacade.setPageSize(100); // pre-load all depts for the dropdown
  }

  private initializeTable(): void {
    this.dataTableConfig.tableConfig.columns.set([
      { field: 'id', header: 'ID', sortable: true, type: TableColumnType.ID },
      { field: 'firstName', header: 'First Name', sortable: true, type: TableColumnType.TEXT },
      { field: 'lastName', header: 'Last Name', sortable: true, type: TableColumnType.TEXT },
      { field: 'email', header: 'Email', type: TableColumnType.TEXT },
      { field: 'phone', header: 'Phone', type: TableColumnType.TEXT },
      { field: 'departmentName', header: 'Department', type: TableColumnType.TEXT },
    ]);

    this.dataTableConfig.tableConfig.actions.set([
      {
        icon: 'pi pi-eye',
        classes: 'p-button-rounded p-button-text p-button-secondary',
        func: (row) => this.openDetailDialog(row.id),
      },
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
      this.dataTableConfig.tableConfig.rows.set(this.filteredEmployees());
      this.dataTableConfig.tableConfig.loading.set(this.isLoading());
    });
  }

  // ── ScalableTable events ──────────────────────────────────────────────

  onSearch(value: string): void {
    this.empFacade.setSearchTerm(value);
  }

  onFiltersChanged(filters: Partial<EmployeeFilters>): void {
    this.empFacade.setFilters(filters as EmployeeFilters);
  }

  onPageChange(event: PageChangeEvent): void {
    if (this.pageSize() !== event.limit) {
      this.empFacade.setPageSize(event.limit);
    }

    if (this.pageNumber() !== event.page) {
      this.empFacade.setPage(event.page);
    }
  }

  // ── Dialog helpers ────────────────────────────────────────────────────

  openNewDialog(): void {
    this.selectedEmployee.set(null);
    this.isFormOpen.set(true);
  }

  openEditDialog(emp: Employee): void {
    this.selectedEmployee.set(emp);
    this.isFormOpen.set(true);
  }

  openDetailDialog(id: number): void {
    this.empFacade.clearEmployeeDetails();
    this.isDetailOpen.set(true);
    this.empFacade.loadEmployeeDetails(id);
  }

  closeDetailDialog(): void {
    this.isDetailOpen.set(false);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────

  onDelete(id: number): void {
    this.empFacade.deleteEmployee(id);
  }
}
