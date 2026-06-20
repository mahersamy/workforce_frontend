

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority: number; // 0 = Low, 1 = Medium, 2 = High, 3 = Critical
  assignedToEmployeeId?: number;
}

export interface UpdateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority: number;
  status: number; // 0 = Pending, 1 = InProgress, 2 = Completed, 3 = Cancelled
  assignedToEmployeeId?: number;
}
