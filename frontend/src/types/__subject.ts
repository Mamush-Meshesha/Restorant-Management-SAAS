export interface Subject {
  subject_id?: string;
  subject_name?: string;
  subject_code?: string;
  grade_level: string;
  description?: string;
  institute_id?: string;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

export interface CreateSubjectData {
  subject_name: string;
  subject_code?: string;
  description?: string;
  institute_id?: string;
}

export interface UpdateSubjectData {
  subject_name?: string;
  subject_code?: string;
  description?: string;
}
