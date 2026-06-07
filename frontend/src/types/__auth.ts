import type { Branch, Organization, Role } from './__restaurant';

export interface AuthResponse {
  message: string;
  token: string;
  refreshToken: string;
  loginExpiry: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login?: string;
  role_id: string;
  role: Role;
  organization_id: string;
  organization?: Organization;
  branch_id?: string | null;
  branch?: Branch | null;
}
