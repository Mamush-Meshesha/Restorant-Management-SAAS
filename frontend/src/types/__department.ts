export interface Department {
  department_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  is_active?: boolean;
}
