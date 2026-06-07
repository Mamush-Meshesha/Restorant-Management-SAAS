import type { Pagination } from "./__index";
import type { Student } from "./__student";

export interface Guardian {
  id: string;
  guardian_id: string;
  first_name: string;
  last_name: string;
  phone_no: string;
  contact_email?: string | null;
  relationship: string;
  created_at: string;
  updated_at: string;

  students?: (Student & {
    relationship: string;
  })[];
}

export interface CreateGuardianResponse {
  message: string;
  guardian: Guardian;
}

export interface GetAllGuardiansResponse {
  message: string;
  data: Guardian[];
  pagination: Pagination;
}

export interface GetSingleGuardianResponse {
  message: string;
  guardian: Guardian;
}