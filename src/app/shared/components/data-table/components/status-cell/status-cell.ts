import { Component, computed, input } from '@angular/core';
import { StatusColumnConfig } from '../../models/colmun-config.model';
import { Select, SelectModule } from "primeng/select";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-cell',
  imports: [[CommonModule, FormsModule, SelectModule]],
  templateUrl: './status-cell.html',
  styleUrl: './status-cell.scss',
})
export class StatusCell {
  /** Raw cell value resolved from the row (e.g. "Pending", "High") */
    value = input.required();
    row = input.required();
    config = input.required<StatusColumnConfig>();

    /** Matches by label first (resolved field is usually a string like "Pending"), falls back to value. */
    currentOption = computed(() => {
        const v = this.value();
        return this.config().options.find((o) => o.label === v || o.value === v) ?? null;
    });

    canEdit = computed(() => {
        const cfg = this.config();
        if (cfg.isEditable) {
            return cfg.isEditable(this.row());
        }
        return !!cfg.editable;
    });

    onValueChange(newValue: any): void {
        if (this.config().onChange) {
            this.config().onChange!(newValue, this.row());
        }
    }
}
