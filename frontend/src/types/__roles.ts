export interface Permission {
  id?: string;
  role_id?: string;
  feature_key: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface Role {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
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
