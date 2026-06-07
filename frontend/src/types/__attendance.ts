export interface Attendance {
  attendance_id: number;
  student_id: number;
  academic_year_id: number;
  class_id: number;
  grade_level_id: number;
  section_id: number;
  attendance_date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  reason?: string;
  recorded_by: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceWithDetails extends Attendance {
  student_name?: string;
  grade_name?: string;
  section_name?: string;
  class_name?: string;
  academic_year_name?: string;
  recorded_by_name?: string;
}

export interface AttendanceSummary {
  student_id: number;
  student_name: string;
  total_present: number;
  total_absent: number;
  total_late: number;
  total_excused: number;
  attendance_percentage: number;
}

export interface WeeklyAttendance {
  student_id: number;
  student_name: string;
  monday?: 'Present' | 'Absent' | 'Late' | 'Excused';
  tuesday?: 'Present' | 'Absent' | 'Late' | 'Excused';
  wednesday?: 'Present' | 'Absent' | 'Late' | 'Excused';
  thursday?: 'Present' | 'Absent' | 'Late' | 'Excused';
  friday?: 'Present' | 'Absent' | 'Late' | 'Excused';
  saturday?: 'Present' | 'Absent' | 'Late' | 'Excused';
  sunday?: 'Present' | 'Absent' | 'Late' | 'Excused';
  total_present: number;
  total_absent: number;
  total_late: number;
  total_excused: number;
}

export interface AttendanceFilter {
  academic_year_id?: number;
  grade_level_id?: number;
  section_id?: number;
  class_id?: number;
  student_id?: number;
  start_date?: string;
  end_date?: string;
  status?: 'Present' | 'Absent' | 'Late' | 'Excused';
}

export interface BulkAttendanceUpdate {
  student_id: number;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  reason?: string;
}
