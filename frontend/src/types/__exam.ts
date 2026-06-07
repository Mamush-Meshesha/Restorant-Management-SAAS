export interface ExamType {
  grade_level_id: string;
  grade_level: string;
  section_id: string;
  class_id: string;
  exam_type_id: string | number;
  id: string;
  name: string;
  description?: string;
  mark: number;
  // max_mark:number;
  weight:number;
  grade: string;
  section: string;
  subject: string;
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  exam_type_id: string;
  exam_type_name?: string;
  grade: string;
  section: string;
  subject: string;
  exam_date: string;
  total_marks: number;
  duration_minutes: number;
  instructions?: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
}

export interface Mark {
  id: string;
  exam_id: string;
  exam_name?: string;
  student_id: string;
  student_name?: string;
  subject: string;
  exam_type: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade?: string;
  remarks?: string;
  recorded_by: string;
  recorded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface MarkSummary {
  id: string;
  student_id: string;
  student_name: string;
  grade: string;
  section: string;
  subject: string;
  total_exams: number;
  total_marks_obtained: number;
  total_possible_marks: number;
  average_percentage: number;
  overall_grade: string;
  last_exam_date?: string;
  academic_year?: string;
}

export interface ExamSchedule {
  id: string;
  exam_id: string;
  exam_name?: string;
  grade: string;
  section: string;
  subject: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room_number?: string;
  invigilator?: string;
  status: "Scheduled" | "In Progress" | "Completed";
  created_at: string;
  updated_at: string;
}
