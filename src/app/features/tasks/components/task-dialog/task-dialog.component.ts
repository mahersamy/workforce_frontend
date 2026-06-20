import { Component, inject, input, model, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { TasksFacadeService } from '../../services/tasks-facade.service';
import { EmployeesApiService } from '../../../employees/services/employees-api.service';
import { Task } from '../../models/task.model';
import { Employee } from '../../../employees/models/employee.model';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { LoadingDirective } from '../../../../shared/directives/loading.diractive';
import { ProgressSpinner } from "primeng/progressspinner";
import { EmployeesFacadeService } from '../../../employees/services/employees-facade.service';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    FieldErrorComponent,
    LoadingDirective,
    ProgressSpinner
  ],
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tasksFacade = inject(TasksFacadeService);
  private readonly empApi = inject(EmployeesApiService);
  private readonly empFacade = inject(EmployeesFacadeService);

  visible = model<boolean>(false);
  task = input<Task | null>(null);

  /** Own local signal for employees */
  employees = signal<Employee[]>([]);
  isSubmitting = this.tasksFacade.isSubmitting;
  isLoadingDetail = signal<boolean>(false);

  priorities = [
    { label: 'Low', value: 0 },
    { label: 'Medium', value: 1 },
    { label: 'High', value: 2 },
    { label: 'Critical', value: 3 },
  ];

  statuses = [
    { label: 'Pending', value: 0 },
    { label: 'In Progress', value: 1 },
    { label: 'Completed', value: 2 },
    { label: 'Cancelled', value: 3 },
  ];

  taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    dueDate: [null as Date | null],
    priority: [1, [Validators.required]],
    status: [0],
    assignedToEmployeeId: [null as number | null],
  });

  isEditMode = () => !!this.task();

  constructor() {
    effect(() => {
      const task = this.task();

      if (task) {
        // ── EDIT mode ─────────────────────────────────────────────────────
        this.isLoadingDetail.set(true);
        // We already have the task, just need to load employees before patchValue
        this.empApi.getEmployees(1, 1000).subscribe({
          next: (res) => {
            this.employees.set(res.data);
            this.taskForm.patchValue({
              title: task.title,
              description: task.description || '',
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              priority: this.getPriorityValue(task.priority),
              status: this.getStatusValue(task.status),
              assignedToEmployeeId: task.assignedToEmployeeId,
            });
            this.isLoadingDetail.set(false);
          },
        });
      } else {
        // ── ADD mode ──────────────────────────────────────────────────────
        this.taskForm.reset({
          title: '',
          description: '',
          dueDate: null,
          priority: 1,
          status: 0,
          assignedToEmployeeId: null
        });
        this.isLoadingDetail.set(true);
    
      }
    });

    // Watch tasksFacade.saveSucceeded() to automatically close dialog on success
    effect(() => {
      if (this.tasksFacade.saveSucceeded() > 0) {
        this.visible.set(false);
      }
    });
  }

  getStatusValue(value: string | number | undefined | null): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const norm = value.toString().toLowerCase().trim();
    switch (norm) {
      case 'pending':
      case '0':
        return 0;
      case 'inprogress':
      case 'in progress':
      case 'in_progress':
      case '1':
        return 1;
      case 'completed':
      case '2':
        return 2;
      case 'cancelled':
      case '3':
        return 3;
      default:
        return 0;
    }
  }

  getPriorityValue(value: string | number | undefined | null): number {
    if (value === null || value === undefined) return 1;
    if (typeof value === 'number') return value;
    const norm = value.toString().toLowerCase().trim();
    switch (norm) {
      case 'low':
      case '0':
        return 0;
      case 'medium':
      case '1':
        return 1;
      case 'high':
      case '2':
        return 2;
      case 'critical':
      case '3':
        return 3;
      default:
        return 1;
    }
  }

  getEmployeeName(val: any): string {
    if (!val) return '';
    if (typeof val === 'object') {
      return `${val.firstName || ''} ${val.lastName || ''}`.trim();
    }
    const emp = this.employees().find((e) => e.id === val);
    return emp ? `${emp.firstName} ${emp.lastName}` : '';
  }

  onSave(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formRaw = this.taskForm.getRawValue();
    const isEdit = this.isEditMode();
    const id = this.task()?.id ?? null;

    const payload = {
      title: formRaw.title,
      description: formRaw.description || undefined,
      dueDate: formRaw.dueDate ? formRaw.dueDate.toISOString() : undefined,
      priority: formRaw.priority,
      assignedToEmployeeId: formRaw.assignedToEmployeeId || undefined,
      ...(isEdit ? { status: formRaw.status } : {})
    };

    this.tasksFacade.saveTask(isEdit, id, payload as any);
    this.taskForm.reset();
  }

  closeFormDialog(): void {
    this.visible.set(false);
  }
}

