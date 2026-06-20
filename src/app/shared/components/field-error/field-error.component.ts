import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FieldErrorMessages } from './interfaces/error-messages.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-error',
  imports: [CommonModule],
  templateUrl: './field-error.component.html',
  styleUrl: './field-error.component.scss',
})
export class FieldErrorComponent {

  control = input.required<AbstractControl>();
  messages = input<FieldErrorMessages>({});

  get errorMessage(): string | null {
    const control = this.control();
    if (control.invalid && control.touched) {
      const errors = control.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        return this.resolveMessage(firstKey);
      }
    }
    return null;
  }

  private defultMessages: FieldErrorMessages = {
    'required': 'This field is required',
    'minlength': 'This field is too short',
    'maxlength': 'This field is too long',
    'email': 'This field is not a valid email',
    'invalidPassword': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
    'pattern': 'This field is not valid',
    ...this.messages()
  }

  resolveMessage(key: string) {
    const mergedMessages = { ...this.defultMessages, ...this.messages() };
    return mergedMessages[key];
  }
}
