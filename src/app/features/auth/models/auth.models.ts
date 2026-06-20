export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  role: string;
  employeeId?: number;
}

export interface RegisterRequest {
  username?: string;
  password?: string;
  email?: string;
  role?: number; 
}

export interface UserProfile {
  userId: number;
  username: string;
  role: string;
  employeeId?: number;
}
