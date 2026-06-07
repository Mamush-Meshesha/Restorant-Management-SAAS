export interface Employee {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  start_date: string;
  contact_phone?: string;
  contact_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Optional UI enhancements
  user_email?: string;
  user_role?: string;
}
