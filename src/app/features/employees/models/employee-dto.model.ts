

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  hireDate: string;
  salary: number;
  departmentId: number;
}

export interface UpdateEmployeeDto {
  firstName: string;
  lastName: string;
  phone?: string;
  salary: number;
  departmentId: number;
  isActive: boolean;
}
