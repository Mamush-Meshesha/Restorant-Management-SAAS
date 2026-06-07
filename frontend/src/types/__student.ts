import type { GradeLevel } from "./__gradeLevels";
import type { Guardian } from "./__guardians";
import type { Pagination } from "./__pagination";
import type { Section } from "./__section";
import type { StudentCategory } from "./__student_category";

export type Gender = "Male" | "Female" | "Other";
export type Relationship = "Father" | "Mother" | "Guardian" | "Other";


// Provide runtime access if needed via an object
export const GenderOptions = {
  Male: "Male" as Gender,
  Female: "Female" as Gender,
  Other: "Other" as Gender,
};

export const RelationshipOptions = {
  Father: "Father" as Relationship,
  Mother: "Mother" as Relationship,
  Guardian: "Guardian" as Relationship,
  Other: "Other" as Relationship,
};


/**
 * Interface representing a student's profile information.
 */
export interface Student {
  id: string | number;
  user_id: string | number | null;
  first_name: string;
  last_name: string;
  full_name?: string;
  gender: string;
  profile_picture?: string;
  date_of_birth: string;
  address?: string;
  religion?: string;
  nationality?: string;
  health_information?: string;
  email?: string;
  phone_number?: string;
  national_id_number?: string;
  birth_certificate_number?: string;
  enrollment_date?: string;
  grade_level_id?: string | number;
  section_id?: string | number;
  guardian_id?: string | number;
  academic_year_id?: string | number;
  status?: string;
  student_category_id?: string | number;
  class_id: string | number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;

  guardian?: Guardian;

  grade_name?: string;
  section_name?: string;
  room_number?: string;
  home_room_teacher_name?: string;
  category?: StudentCategory;

  section?: Section;
  gradeLevel?: GradeLevel;
  studentCategory?: StudentCategory;
  studentRegisterationStatus?: string;

  class?: {
    grade_name: string;
    section_name: string;
    room_number: string;
  };
}
export interface CreateStudentResponse {
  message: string;
  student: Student;
}

export interface GetAllStudentsResponse {
  message: string;
  data: Student[]
  pagination: Pagination;
}

export interface GetSingleStudentResponse {
  message: string;
  student: Student;
}
