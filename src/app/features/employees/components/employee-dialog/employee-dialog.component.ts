import { Component, inject, input, model, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EmployeesFacadeService } from '../../services/employees-facade.service';
import { DepartmentsFacadeService } from '../../../departments/services/departments-facade.service';
import { Employee } from '../../models/employee.model';
import { FieldErrorComponent } from "../../../../shared/components/field-error/field-error.component";
import { LoadingDirective } from "../../../../shared/directives/loading.diractive";

@Component({
  selector: 'app-employee-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ProgressSpinnerModule,
    FieldErrorComponent,
    LoadingDirective
  ],
  templateUrl: './employee-dialog.component.html',
  styleUrls: ['./employee-dialog.component.scss']
})
export class EmployeeDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly empFacade = inject(EmployeesFacadeService);
  private readonly deptFacade = inject(DepartmentsFacadeService);

  visible = model<boolean>(false);
  employee = input<Employee | null>(null);

  departments = this.deptFacade.departments;
  isSubmitting = this.empFacade.isSubmitting;
  isLoadingDetail = signal<boolean>(false);

  employeeForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    hireDate: [new Date(), [Validators.required]],
    salary: [0, [Validators.required, Validators.min(0)]],
    departmentId: [null as number | null, [Validators.required]],
    isActive: [true],
  });

  isEditMode = () => !!this.employee();

  constructor() {
    // Watch for employee input changes
    effect(() => {
      const emp = this.employee();
      if (emp) {

        this.isLoadingDetail.set(true);
        this.empFacade.getEmployeeDetails(emp.id).subscribe({
          next: (detail) => {
            this.isLoadingDetail.set(false);
            this.employeeForm.patchValue({
              firstName: detail.firstName,
              lastName: detail.lastName,
              email: detail.email,
              phone: detail.phone || '',
              hireDate: new Date(detail.hireDate),
              salary: detail.salary,
              departmentId: detail.departmentId,
              isActive: detail.isActive,
            });
          },
          error: () => {
            this.isLoadingDetail.set(false);
            this.visible.set(false);
          },
        });
      } else {
        this.employeeForm.reset();
        this.isLoadingDetail.set(false);
      }
    });

    // Close the dialog on save success
    effect(() => {
      if (this.empFacade.saveSucceeded() > 0) {
        this.visible.set(false);
      }
    });
  }

  onSave(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formRaw = this.employeeForm.getRawValue();
    const isEdit = this.isEditMode();
    const id = this.employee()?.id ?? null;

    if (isEdit) {
      const payload = {
        firstName: formRaw.firstName,
        lastName: formRaw.lastName,
        phone: formRaw.phone || undefined,
        salary: formRaw.salary,
        departmentId: formRaw.departmentId!,
        isActive: formRaw.isActive,
      };
      this.empFacade.saveEmployee(isEdit, id, payload);
    } else {
      const payload = {
        firstName: formRaw.firstName,
        lastName: formRaw.lastName,
        email: formRaw.email,
        phone: formRaw.phone || undefined,
        hireDate: formRaw.hireDate.toISOString(),
        salary: formRaw.salary,
        departmentId: formRaw.departmentId!,
      };
      this.empFacade.saveEmployee(isEdit, id, payload);
    }
    this.employeeForm.reset()
  }

  closeFormDialog(): void {
    this.visible.set(false);
  }
}
