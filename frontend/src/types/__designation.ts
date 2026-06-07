export interface Designation {
  designation_id: string;
  name: string;
  status?: "active" | "inactive";
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
