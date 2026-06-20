import { Component, input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { SelectColumnConfig } from "../../models/colmun-config.model";

@Component({
    selector: "app-select-cell",
    standalone: true,
    imports: [FormsModule, SelectModule],
    template: `
        <p-select 
            [ngModel]="value()" 
            (ngModelChange)="onValueChange($event)"
            [options]="config().options" 
            [optionLabel]="config().optionLabel || 'label'" 
            [optionValue]="config().optionValue || 'value'"
            [placeholder]="config().placeholder || 'Select'"
            appendTo="body"
            styleClass="w-full">
        </p-select>
    `
})
export class SelectCell {
    value = input<any>();
    row = input<any>();
    config = input.required<SelectColumnConfig>();

    onValueChange(newValue: any) {
        if (this.config().onChange) {
            this.config().onChange!(newValue, this.row());
        }
    }
}
