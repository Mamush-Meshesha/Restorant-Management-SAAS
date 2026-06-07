import type { ContractType } from "@/types/__contract_type";
import type { AxiosResponse } from "axios";
import api from ".";

// API Response Types
export interface ContractTypesResponse {
  message: string;
  contractTypes: ContractType[];
}

export interface SingleContractTypeResponse {
  message: string;
  contractType: ContractType;
}

export interface DeleteContractTypeResponse {
  message: string;
}

export interface ContractTypesPaginatedResponse {
  message: string;
  data: ContractType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContractTypeWithEmployeesResponse {
  message: string;
  contractType: ContractType;
}

export interface ContractTypeStatisticsResponse {
  message: string;
  statistics: {
    totalContractTypes: number;
    activeContractTypes: number;
    inactiveContractTypes: number;
  };
}

export interface ContractTypeFilterParams {
  search?: string;
  is_active?: boolean;
}

// Request Types
export interface CreateContractTypeData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateContractTypeData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// API Functions
export const getAllContractTypes = (params?: {
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<ContractTypesPaginatedResponse>> => {
  return api.get("/contractType/get_all_contract_types", { params });
};

export const getActiveContractTypes = (): Promise<
  AxiosResponse<ContractTypesResponse>
> => {
  return api.get("/contractType/get_active_contract_types");
};

export const getContractTypesWithFilter = (
  params?: ContractTypeFilterParams
): Promise<AxiosResponse<ContractTypesResponse>> => {
  return api.get("/contractType/get_contract_types_with_filter", { params });
};

export const getContractTypesWithFilterPaginated = (params?: {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<ContractTypesPaginatedResponse>> => {
  return api.get("/contractType/get_contract_types_with_filter_paginated", {
    params,
  });
};

export const getContractTypeById = (
  contractTypeId: string
): Promise<AxiosResponse<SingleContractTypeResponse>> => {
  return api.get(`/contractType/get_contract_type/${contractTypeId}`);
};

export const getContractTypeWithEmployees = (
  contractTypeId: string
): Promise<AxiosResponse<ContractTypeWithEmployeesResponse>> => {
  return api.get(
    `/contractType/get_contract_type_with_employees/${contractTypeId}`
  );
};

export const createContractType = (
  payload: CreateContractTypeData
): Promise<AxiosResponse<SingleContractTypeResponse>> => {
  return api.post("/contractType/create_contract_type", payload);
};

export const updateContractType = (
  contractTypeId: string,
  payload: UpdateContractTypeData
): Promise<AxiosResponse<SingleContractTypeResponse>> => {
  return api.put(
    `/contractType/update_contract_type/${contractTypeId}`,
    payload
  );
};

export const deleteContractType = (
  contractTypeId: string
): Promise<AxiosResponse<DeleteContractTypeResponse>> => {
  return api.delete(`/contractType/delete_contract_type/${contractTypeId}`);
};

export const getContractTypeStatistics = (): Promise<
  AxiosResponse<ContractTypeStatisticsResponse>
> => {
  return api.get("/contractType/get_contract_type_statistics");
};

// Legacy exports for backward compatibility
export type CreateContractTypeFormData = CreateContractTypeData;
export type CreateContractTypeResponse = SingleContractTypeResponse;
