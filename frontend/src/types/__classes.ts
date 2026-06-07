import type { Employee } from "./__employees";
import type { GradeLevel } from "./__gradeLevels";
import type { Room } from "./__rooms";
import type { Section } from "./__section";
import type { Student } from "./__student";


export interface ClassItem {
  class_id: string;
  class_name?: string;
  institute_id?: string;
  grade_level_id?: string;
  section_id?: string;
  class_code?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  home_room_teacher_id?: string;
  home_room_teacher_name?: string;
  academic_year_id?: string;
  description?: string;
  room_id?: string;
  gradeLevel: GradeLevel;
  

  room_number?: string;

  // UI-display helpers
  institute_name?: string;
  grade_name?: string;
  room?: Room;
  section_name?: string;

  section?: Section;

  subjects?: any[];
  home_room_teacher?: Employee;

  students?: Student[];

  capacity?: number;
  _count?: {
    students: number;
    subjects: number;
    maleStudents: number;
    femaleStudents: number;
  };
}
