
export type priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type status = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: priority; // "Low", "Medium", "High", "Critical"
  status: status; // "Pending", "InProgress", "Completed", "Cancelled"
  assignedToEmployeeId?: number;
  assignedToEmployeeName?: string;
  createdByUsername: string;
  createdAt: string;
}


