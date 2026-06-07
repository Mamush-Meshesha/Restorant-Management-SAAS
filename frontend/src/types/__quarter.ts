export interface Quarter {
  id: number;
  quarter_id: number;
  name: string;
  academic_year_id: string;
  start_date: string;
  end_date: string;
  description?: string;
  status: string;
  computed_status?: string; // e.g., "Ongoing", "Completed", "Upcoming"
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

export interface CreateQuarterData {
  name: string;
  academic_year_id: string;
  start_date: string;
  end_date: string;
  description?: string;
  status: string;
}

export interface UpdateQuarterData {
  name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  status?: string;
}
export interface PaginatedQuarters {
  message: string;
  data: Quarter[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface QuarterFilterParams {
  name?: string;
  page?: number;
  limit?: number;
}