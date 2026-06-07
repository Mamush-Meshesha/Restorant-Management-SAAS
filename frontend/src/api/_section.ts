import type { Section } from "@/types/__section";
import type { AxiosResponse } from "axios";
import api from ".";

// API Response Types
export interface SectionsResponse {
  message: string;
  data: Section[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };

}

export interface SingleSectionResponse {
  message: string;
  section: Section;
}

export interface SectionsSearchResponse {
  message: string;
  sections: Section[];
  total: number;
  page: number;
  limit: number;
}

export interface SectionStatisticsResponse {
  message: string;
  statistics: {
    totalSections: number;
    activeSections: number;
    sectionsWithStudents: number;
  };
}

export interface DeleteSectionResponse {
  message: string;
}

// Request Types
export interface CreateSectionData {
  description?: string;
  section_code?: string;
  name: string;
}

export interface UpdateSectionData {
  name?: string;
  description?: string;
  section_code?: string;
}

export interface SectionFilterParams {
  page?: number;
  limit?: number;

  searchTerm?: string;
  status?: string;
  name?: string;
  section_code?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SectionSearchParams {
  name?: string;
  page?: number;
  limit?: number;
}

// API Functions
export const getAllSections = (  params?: SectionFilterParams
): Promise<AxiosResponse<SectionsResponse>> => {
  return api.get("/section/get-all-sections", { params });
};

export const getSectionsWithFilter = (
  params?: SectionFilterParams
): Promise<AxiosResponse<SectionsResponse>> => {
  return api.get("/section/filter", { params });
};

export const searchSections = (
  params?: SectionSearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<SectionsSearchResponse>> => {
  return api.get("/section/search", { params, signal });
};

export const getSectionById = (
  sectionId: string
): Promise<AxiosResponse<SingleSectionResponse>> => {
  return api.get(`/section/${sectionId}`);
};

export const getSectionWithDetails = (
  sectionId: string
): Promise<AxiosResponse<SingleSectionResponse>> => {
  return api.get(`/section/details/${sectionId}`);
};

export const getSectionStatistics = (): Promise<
  AxiosResponse<SectionStatisticsResponse>
> => {
  return api.get("/section/statistics");
};

export const createSection = (
  payload: CreateSectionData
): Promise<AxiosResponse<SingleSectionResponse>> => {
  return api.post("/section/create", payload);
};

export const updateSection = (
  sectionId: string,
  payload: UpdateSectionData
): Promise<AxiosResponse<SingleSectionResponse>> => {
  return api.put(`/section/${sectionId}`, payload);
};

export const deleteSection = (
  sectionId: string
): Promise<AxiosResponse<DeleteSectionResponse>> => {
  return api.delete(`/section/${sectionId}`);
};

// Legacy exports for backward compatibility
export type CreateSectionFormData = CreateSectionData;
export type CreateSectionResponse = SingleSectionResponse;
