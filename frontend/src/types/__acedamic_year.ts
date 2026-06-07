export interface AcademicYear {
  academic_year_id: string;
  institute_id: string;
  name: string;
  start_date: Date;
  description: string;
  end_date: Date;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedAcademicYears {
message: string;
academicYears: AcademicYear[];
pagination: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
}
