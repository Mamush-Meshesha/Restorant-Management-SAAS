import type { GradeLevel } from "@/types/__gradeLevels";
import type { AxiosResponse } from "axios";
import api from ".";

// API Response Types
export interface GreadeLevelsResponse {
  message: string;
  gradeLevels: GradeLevel[];
}

export interface SingleGradeLevelResponse {
  message: string;
  gradeLevel: GradeLevel;
}

export interface GradeLevelsSearchResponse {
  message: string;
  data: GradeLevel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GradeLevelStatisticsResponse {
  message: string;
  statistics: {
    totalSections: number;
    activeSections: number;
    sectionsWithStudents: number;
  };
}

export interface DeleteGradeLevelResponse {
  message: string;
}

// Request Types
export interface CreateGradeLevelData {
  name: string;
  description?: string;
  cycle_id?: string;
}

export interface UpdateGradeLevelData {
  name?: string;
  description?: string;
  cycle_id?: string;
}

// export interface SectionFilterParams {
//   name?: string;
//   section_code?: string;
//   dateFrom?: string;
//   dateTo?: string;
// }

// export interface SectionSearchParams {
//   searchTerm?: string;
//   page?: number;
//   limit?: number;
// }

// API Functions
export const getAllGradeLevels = (): Promise<AxiosResponse<GradeLevelsSearchResponse>> => {
  return api.get("/gradeLevel/get_all");
};

// New: paginated / cancellable getAllGradeLevels variant
export interface GradeLevelsSearchParams {
  page?: number;
  limit?: number;
  name?: string;
}

export const getAllGradeLevelsPaged = (
  params?: GradeLevelsSearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<GradeLevelsSearchResponse>> => {
  return api.get("/gradeLevel/get_all", { params, signal });
};

// export const getSectionsWithFilter = (
//   params?: SectionFilterParams
// ): Promise<AxiosResponse<SectionsResponse>> => {
//   return api.get("/section/filter", { params });
// };

// export const searchSections = (
//   params?: SectionSearchParams
// ): Promise<AxiosResponse<SectionsSearchResponse>> => {
//   return api.get("/section/search", { params });
// };

// export const getSectionById = (
//   sectionId: string
// ): Promise<AxiosResponse<SingleSectionResponse>> => {
//   return api.get(`/section/${sectionId}`);
// };

// export const getSectionWithDetails = (
//   sectionId: string
// ): Promise<AxiosResponse<SingleSectionResponse>> => {
//   return api.get(`/section/details/${sectionId}`);
// };

// export const getSectionStatistics = (): Promise<
//   AxiosResponse<SectionStatisticsResponse>
// > => {
//   return api.get("/section/statistics");
// };

export const createGradeLevel = (
  payload: CreateGradeLevelData
): Promise<AxiosResponse<SingleGradeLevelResponse>> => {
  return api.post("/gradeLevel/create", payload);
};

export const updateGradeLevel = (
  gradeLevelId: string,
  payload: UpdateGradeLevelData
): Promise<AxiosResponse<SingleGradeLevelResponse>> => {
  return api.put(`/gradeLevel/update/${gradeLevelId}`, payload);
};

export const deleteGradeLevel = (
  gradeLevelId: string
): Promise<AxiosResponse<DeleteGradeLevelResponse>> => {
  return api.delete(`/gradeLevel/delete/${gradeLevelId}`);
};

// // Legacy exports for backward compatibility
// export type CreateSectionFormData = CreateSectionData;
// export type CreateSectionResponse = SingleSectionResponse;
