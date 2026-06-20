import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacadeService } from '../../services/auth-facade.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { LoadingDirective } from '../../../../shared/directives/loading.diractive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MessageModule,
    LoadingDirective
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacadeService);

  registerForm: FormGroup;
  
  // Use facade signals directly
  isLoading = this.authFacade.isLoading;
  errorMessage = this.authFacade.error;

  roles = [
    { label: 'Employee', value: 0 },
    { label: 'Manager', value: 1 },
    { label: 'Admin', value: 2 }
  ];

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [0, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Facade handles the subscription, state updates, toast message, and navigation internally now
    this.authFacade.register(this.registerForm.value);
  }
}
