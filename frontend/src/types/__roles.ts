export interface Role {
  role_id: string;
  name: string;
  description?: string;
  permissions: Record<string, object> | null;
  is_system_defined: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  _count: RoleCount;
}

export interface RoleCount {
  users: number;
}

export interface RoleStatistics {
  totalRoles: number;
  systemDefinedRoles: number;
  customRoles: number;
  rolesWithUsers: number;
}
