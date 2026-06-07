export interface User {
  first_name: string;
  last_name: string;
  user_id: string;
  username: string;
  // organization: string;
  password_hash: string;
  email: string;
  role_id: string;
  role_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
