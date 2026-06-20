import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthFacadeService } from '../../services/auth-facade.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { LoadingDirective } from '../../../../shared/directives/loading.diractive';
import { FieldErrorComponent } from "../../../../shared/components/field-error/field-error.component";
import { LoginRequest } from '../../models/auth.models';
import { passwordValidator } from '../../../../shared/validation/password.validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    LoadingDirective,
    FieldErrorComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacadeService);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, passwordValidator]]
  });

  isLoading = this.authFacade.isLoading;
  errorMessage = this.authFacade.error;



  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authFacade.login(this.loginForm.value as LoginRequest);
  }
}
