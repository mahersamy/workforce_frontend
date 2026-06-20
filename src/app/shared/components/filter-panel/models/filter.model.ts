export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: {
    label: string;
    value: any;
  }[];
}

export interface FilterChangeEvent {
  [key: string]: any;
}