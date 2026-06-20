import { Component, inject, input, model, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { LoadingDirective } from '../../../../shared/directives/loading.diractive';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { DepartmentsFacadeService } from '../../services/departments-facade.service';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-department-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    LoadingDirective,
    FieldErrorComponent
  ],
  templateUrl: './department-dialog.component.html',
  styleUrls: ['./department-dialog.component.scss']
})
export class DepartmentDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly deptFacade = inject(DepartmentsFacadeService);

  visible = model<boolean>(false);
  department = input<Department | null>(null);

  isLoading = this.deptFacade.isLoading;
  isSubmitting = this.deptFacade.isSubmitting;

  deptForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  isEditMode = () => !!this.department();

  constructor() {
    // Watch for department input changes to reset or patch form
    effect(() => {
      const dept = this.department();
      if (dept) {
        this.deptForm.patchValue({
          name: dept.name,
          description: dept.description || ''
        });
      } else {
        this.deptForm.reset();
      }
    });

    // Automatically close the dialog when saving succeeds
    effect(() => {
      if (this.deptFacade.saveSucceeded() > 0) {
        this.visible.set(false);
      }
    });
  }

  onSave(): void {
    if (this.deptForm.invalid) {
      this.deptForm.markAllAsTouched();
      return;
    }
    const deptData = this.deptForm.getRawValue();
    const isEdit = this.isEditMode();
    const id = this.department()?.id ?? null;
    this.deptFacade.saveDepartment(isEdit, id, deptData);
    this.deptForm.reset()

  }

  closeDialog(): void {
    this.visible.set(false);
  }
}
