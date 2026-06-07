import type { Pagination } from "./__index";

export interface StudentCategory {
  category_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

export interface CreateStudentCategoryData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateStudentCategoryData {
  name?: string;
  description?: string;
  is_active?: boolean;
}


// API Response Types
export interface StudentCategoriesResponse {
  message: string;
  data: StudentCategory[];
  pagination?:  Pagination;

}

export interface SingleStudentCategoryResponse {
  message: string;
  category: StudentCategory;
}

export interface DeleteStudentCategoryResponse {
  message: string;
}

export interface StudentCategoriesPaginatedResponse {
  message: string;
  data: StudentCategory[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface StudentCategoryStatisticsResponse {
  message: string;
  statistics: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
  };
}

export interface StudentCategoryFilterParams {
  page?: number;
  limit?: number;
  name?: string;
  is_active?: boolean;
}

// Request Types
export interface CreateStudentCategoryData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateStudentCategoryData {
  name?: string;
  description?: string;
  is_active?: boolean;
}
