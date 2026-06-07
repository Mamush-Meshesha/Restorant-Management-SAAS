import type { AxiosResponse } from "axios";
import api from ".";

// Designation Type
export interface Designation {
  designation_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// API Response Types
export interface DesignationsResponse {
  message: string;
  designations: Designation[];
}

export interface SingleDesignationResponse {
  message: string;
  designation: Designation;
}

export interface DeleteDesignationResponse {
  message: string;
}

export interface DesignationsPaginatedResponse {
  message: string;
  data: Designation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DesignationWithEmployeesResponse {
  message: string;
  designation: Designation;
}

export interface DesignationStatisticsResponse {
  message: string;
  statistics: {
    totalDesignations: number;
    activeDesignations: number;
    inactiveDesignations: number;
  };
}

export interface DesignationFilterParams {
  search?: string;
  is_active?: boolean;
}

// Request Types
export interface CreateDesignationData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateDesignationData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// API Functions
export const getAllDesignations = (params?: {
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<DesignationsPaginatedResponse>> => {
  return api.get("/designation/get_all_designations", { params });
};

export const getActiveDesignations = (): Promise<
  AxiosResponse<DesignationsResponse>
> => {
  return api.get("/designation/get_active_designations");
};

export const getDesignationsWithFilter = (
  params?: DesignationFilterParams
): Promise<AxiosResponse<DesignationsResponse>> => {
  return api.get("/designation/get_designations_with_filter", { params });
};

export const getDesignationsWithFilterPaginated = (params?: {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<DesignationsPaginatedResponse>> => {
  return api.get("/designation/get_designations_with_filter_paginated", {
    params,
  });
};

export const getDesignationById = (
  designationId: string
): Promise<AxiosResponse<SingleDesignationResponse>> => {
  return api.get(`/designation/get_designation/${designationId}`);
};

export const getDesignationWithEmployees = (
  designationId: string
): Promise<AxiosResponse<DesignationWithEmployeesResponse>> => {
  return api.get(
    `/designation/get_designation_with_employees/${designationId}`
  );
};

export const createDesignation = (
  payload: CreateDesignationData
): Promise<AxiosResponse<SingleDesignationResponse>> => {
  return api.post("/designation/create_designation", payload);
};

export const updateDesignation = (
  designationId: string,
  payload: UpdateDesignationData
): Promise<AxiosResponse<SingleDesignationResponse>> => {
  return api.put(`/designation/update_designation/${designationId}`, payload);
};

export const deleteDesignation = (
  designationId: string
): Promise<AxiosResponse<DeleteDesignationResponse>> => {
  return api.delete(`/designation/delete_designation/${designationId}`);
};

export const getDesignationStatistics = (): Promise<
  AxiosResponse<DesignationStatisticsResponse>
> => {
  return api.get("/designation/get_designation_statistics");
};
