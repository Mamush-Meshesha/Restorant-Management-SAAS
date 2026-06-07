import type { Department } from "@/types/__department";
import type { AxiosResponse } from "axios";
import api from ".";

// API Response Types
export interface DepartmentsResponse {
  message: string;
  departments: Department[];
}

export interface SingleDepartmentResponse {
  message: string;
  department: Department;
}

export interface DeleteDepartmentResponse {
  message: string;
}

export interface DepartmentsPaginatedResponse {
  message: string;
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentWithEmployeesResponse {
  message: string;
  department: Department;
}

export interface DepartmentStatisticsResponse {
  message: string;
  statistics: {
    totalDepartments: number;
    activeDepartments: number;
    inactiveDepartments: number;
  };
}

export interface DepartmentFilterParams {
  search?: string;
  is_active?: boolean;
}

// Request Types
export interface CreateDepartmentData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateDepartmentData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// API Functions
export const getAllDepartments = (params?: {
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<DepartmentsPaginatedResponse>> => {
  return api.get("/department/get_all_departments", { params });
};

export const getActiveDepartments = (): Promise<
  AxiosResponse<DepartmentsResponse>
> => {
  return api.get("/department/get_active_departments");
};

export const getDepartmentsWithFilter = (
  params?: DepartmentFilterParams
): Promise<AxiosResponse<DepartmentsResponse>> => {
  return api.get("/department/get_departments_with_filter", { params });
};

export const getDepartmentsWithFilterPaginated = (params?: {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<DepartmentsPaginatedResponse>> => {
  return api.get("/department/get_departments_with_filter_paginated", { params });
};

export const getDepartmentById = (
  departmentId: string
): Promise<AxiosResponse<SingleDepartmentResponse>> => {
  return api.get(`/department/get_department/${departmentId}`);
};

export const getDepartmentWithEmployees = (
  departmentId: string
): Promise<AxiosResponse<DepartmentWithEmployeesResponse>> => {
  return api.get(`/department/get_department_with_employees/${departmentId}`);
};

export const createDepartment = (
  payload: CreateDepartmentData
): Promise<AxiosResponse<SingleDepartmentResponse>> => {
  return api.post("/department/create_department", payload);
};

export const updateDepartment = (
  departmentId: string,
  payload: UpdateDepartmentData
): Promise<AxiosResponse<SingleDepartmentResponse>> => {
  return api.put(`/department/update_department/${departmentId}`, payload);
};

export const deleteDepartment = (
  departmentId: string
): Promise<AxiosResponse<DeleteDepartmentResponse>> => {
  return api.delete(`/department/delete_department/${departmentId}`);
};

export const getDepartmentStatistics = (): Promise<
  AxiosResponse<DepartmentStatisticsResponse>
> => {
  return api.get("/department/get_department_statistics");
};

// Legacy exports for backward compatibility
export type CreateDepartmentFormData = CreateDepartmentData;
export type CreateDepartmentResponse = SingleDepartmentResponse;
