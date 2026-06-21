import {TableColumnType} from "../enums/colmun-type.enum";

// ─── Base ─────────────────────────────────────────────────────────────────────
interface BaseColumnConfig {
    field: string;
    header: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

// ─── Per-cell extended configs ────────────────────────────────────────────────
export interface IdColumnConfig extends BaseColumnConfig {
    type: TableColumnType.ID;
}

export interface TextColumnConfig extends BaseColumnConfig {
    type: TableColumnType.TEXT;
    classes?: string;
    suffix?: string;
}

export interface DateColumnConfig extends BaseColumnConfig {
    type: TableColumnType.DATE;
    dateFormat?: string;
    classes?: string;
}

export interface UserColumnConfig extends BaseColumnConfig {
    type: TableColumnType.USER;
    subtitleField?: string;
    imageField?: string;
    subtitleColor?: string;
}

export interface CurrencyColumnConfig extends BaseColumnConfig {
    type: TableColumnType.CURRENCY;
    currencyCode?: string;
    currencyDisplay?: string;
    digitsInfo?: string;
    classes?: string;
}

export interface SelectColumnConfig extends BaseColumnConfig {
    type: TableColumnType.SELECT;
    options: any[];
    optionLabel?: string;
    optionValue?: string;
    onChange?: (value: any, row: any) => void;
    placeholder?: string;
}

// ─── Status / badge cell ──────────────────────────────────────────────────────
export type BadgeSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary';

export interface StatusBadgeOption {
    label: string;
    /** The value submitted on change — keep this the raw value your API expects (e.g. numeric enum). */
    value: any;
    severity: BadgeSeverity;
}

export interface StatusColumnConfig extends BaseColumnConfig {
    type: TableColumnType.STATUS;
    options: StatusBadgeOption[];
    /** Static editability for the whole column. Ignored if `isEditable` is provided. */
    editable?: boolean;
    /** Per-row editability — e.g. only the assignee or a manager can change a task's status. */
    isEditable?: (row: any) => boolean;
    onChange?: (value: any, row: any) => void;
}


// ─── Union — use this everywhere ─────────────────────────────────────────────
export type ColumnConfig =
    | IdColumnConfig
    | TextColumnConfig
    | DateColumnConfig
    | UserColumnConfig
    | CurrencyColumnConfig
    | SelectColumnConfig
    | StatusColumnConfig;
