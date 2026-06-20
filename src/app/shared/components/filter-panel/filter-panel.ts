import { Component, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-filter-panel',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
  ],
  templateUrl: './filter-panel.html',
  styleUrls: ['./filter-panel.scss'],
})
export class FilterPanel {
  fields = input.required<any[]>();

  filtersChanged = output<any>();

  private fb = new FormBuilder();

  form = this.fb.group({});

  ngOnInit() {
    const controls: any = {};

    const f = this.fields();
    f.forEach((field) => {
      // Initialize with null for optional filters, empty string for text inputs
      controls[field.key] = [field.type === 'text' ? '' : null];
    });

    this.form = this.fb.group(controls);

    this.form.valueChanges.subscribe((value) => {
      this.filtersChanged.emit(value);
    });
  }

  applyFilters() {
    this.filtersChanged.emit(this.form.value);
  }

  clearFilters() {
    this.form.reset();
    this.filtersChanged.emit(this.form.value);
  }
}
