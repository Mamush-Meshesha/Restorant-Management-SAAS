import type { Cycle } from "./__cycle";

export interface GradeLevel {
  grade_level_id: string;
  institute_id?: string;
  name: string;
  cycle_id?: string;
  cycle_name?: string;
  is_last_level?: string;
  next_grade_level_id?: string;
  next_grade_level_name?: string;
  created_at: string;
  updated_at: string;
  description?: string;

  // UI-display helpers
  academic_year_name?: string;
  cycle?: Cycle | null;

}
