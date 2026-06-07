import type { Cycle } from "@/types/__cycle";
import type { AxiosResponse } from "axios";
import api from ".";

// API Response Types
export interface CyclesResponse {
  message: string;
  data: Cycle[];

}

export interface SingleCycleResponse {
  message: string;
  cycle: Cycle;
}

export interface CyclesSearchResponse {
  message?: string;
  data: Cycle[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CycleStatisticsResponse {
  message: string;
  statistics: {
    totalCycles: number;
    activeCycles: number;
    cyclesWithGrades: number;
  };
}

export interface DeleteCycleResponse {
  message: string;
}

// Request Types
export interface CreateCycleData {
  name: string;
  description?: string;
}

export interface UpdateCycleData {
  name?: string;
  description?: string;
}

export interface CycleFilterParams {
  name?: string;
  description?: string;
}

export interface CycleSearchParams {
  searchTerm?: string;
  name?: string;
  page?: number;
  limit?: number;
}

// API Functions
export const getAllCycles = (params?: CycleFilterParams
): Promise<AxiosResponse<CyclesResponse>> => {
  return api.get("/cycle/get_all_cycles", { params });
};

export const getCyclesWithFilter = (
  params?: CycleFilterParams
): Promise<AxiosResponse<CyclesResponse>> => {
  return api.get("/cycle/get_cycles_with_filter", { params });
};

export const searchCycles = (
  params?: CycleSearchParams
): Promise<AxiosResponse<CyclesSearchResponse>> => {
  return api.get("/cycle/search_cycles", { params });
};

// New: paginated / cancellable getAllCycles variant
export const getAllCyclesPaged = (
  params?: CycleSearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<CyclesSearchResponse>> => {
  return api.get("/cycle/get_all_cycles", { params, signal });
};

export const getCycleById = (
  cycleId: number
): Promise<AxiosResponse<SingleCycleResponse>> => {
  return api.get(`/cycle/get_cycle_by_id/${cycleId}`);
};

export const getCycleWithDetails = (
  cycleId: number
): Promise<AxiosResponse<SingleCycleResponse>> => {
  return api.get(`/cycle/get_cycle_with_details/${cycleId}`);
};

export const getCycleStatistics = (): Promise<
  AxiosResponse<CycleStatisticsResponse>
> => {
  return api.get("/cycle/get_cycle_statistics");
};

export const createCycle = (
  payload: CreateCycleData
): Promise<AxiosResponse<SingleCycleResponse>> => {
  return api.post("/cycle/create_cycle", payload);
};

export const updateCycle = (
  cycleId: string,
  payload: UpdateCycleData
): Promise<AxiosResponse<SingleCycleResponse>> => {
  return api.put(`/cycle/update_cycle/${cycleId}`, payload);
};

export const deleteCycle = (
  cycleId: string
): Promise<AxiosResponse<DeleteCycleResponse>> => {
  return api.delete(`/cycle/delete_cycle/${cycleId}`);
};

// Legacy exports for backward compatibility
export type CreateCycleFormData = CreateCycleData;
export type CreateCycleResponse = SingleCycleResponse;
