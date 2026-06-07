import type { Role } from "@/types/__roles";
import type { AxiosResponse } from "axios";
import api from ".";

// API Response Types
export interface RolesResponse {
  message: string;
  roles: Role[];
}

export interface SingleRoleResponse {
  message: string;
  role: Role;
}

export interface PaginatedRolesResponse {
  message: string;
  roles: Role[];
  currentPage: number;
  total: number;
  totalPages: number;
}

export interface RoleStatisticsResponse {
  message: string;
  statistics: {
    totalRoles: number;
    systemDefinedRoles: number;
    customRoles: number;
    rolesWithUsers: number;
  };
}

export interface DeleteRoleResponse {
  message: string;
}

// Request Types
export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

export interface RoleFilterParams {
  search?: string;
  is_system_defined?: boolean;
}

export interface RolePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// API Functions
export const getAllRoles = (): Promise<AxiosResponse<RolesResponse>> => {
  return api.get("/role/get_all_roles");
};

export const getRolesWithFilter = (
  params?: RoleFilterParams
): Promise<AxiosResponse<RolesResponse>> => {
  return api.get("/role/get_roles_with_filter", { params });
};

export const getRolesPaginated = (
  params?: RolePaginationParams
): Promise<AxiosResponse<PaginatedRolesResponse>> => {
  return api.get("/role/get_roles_paginated", { params });
};

export const getRoleById = (
  roleId: string
): Promise<AxiosResponse<SingleRoleResponse>> => {
  return api.get(`/role/get_role/${roleId}`);
};

export const getRoleWithUsers = (
  roleId: string
): Promise<AxiosResponse<SingleRoleResponse>> => {
  return api.get(`/role/get_role_with_users/${roleId}`);
};

export const getRoleStatistics = (): Promise<
  AxiosResponse<RoleStatisticsResponse>
> => {
  return api.get("/role/get_role_statistics");
};

export const createRole = (
  payload: CreateRoleData
): Promise<AxiosResponse<SingleRoleResponse>> => {
  return api.post("/role/create_role", payload);
};

export const updateRole = (
  roleId: string,
  payload: UpdateRoleData
): Promise<AxiosResponse<SingleRoleResponse>> => {
  return api.put(`/role/update_role/${roleId}`, payload);
};

export const deleteRole = (
  roleId: string
): Promise<AxiosResponse<DeleteRoleResponse>> => {
  return api.delete(`/role/delete_role/${roleId}`);
};

// Legacy exports for backward compatibility
export const getRoles = getAllRoles;
export type CreateRoleFormData = CreateRoleData;
export type CreateRoleResponse = SingleRoleResponse;
