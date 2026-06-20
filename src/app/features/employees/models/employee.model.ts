export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: number;
  departmentName: string;
  hireDate: string;
  salary: number;
  isActive: boolean;
}

export interface EmployeeDetail extends Employee {
  hireDate: string;
  salary: number;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
}

export interface CreateEmployee {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  hireDate: string;
  salary: number;
  departmentId: number;
}

export interface UpdateEmployee {
  firstName: string;
  lastName: string;
  phone?: string;
  salary: number;
  departmentId: number;
  isActive: boolean;
}
