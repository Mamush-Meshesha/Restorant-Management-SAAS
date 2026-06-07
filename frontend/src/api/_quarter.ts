import type { PaginatedQuarters, Quarter, QuarterFilterParams } from "@/types/__quarter";
import type { AxiosResponse } from "axios";
import api from ".";

// API Response Types
export interface QuartersResponse {
  message?: string;
  quarters?: Quarter[];
}

// Union type to handle both direct array and wrapped response formats

export interface SingleQuarterResponse {
  message: string;
  quarter: Quarter;
}

export interface DeleteQuarterResponse {
  message: string;
}

// Request Types
export interface CreateQuarterData {
  name: string;
  // academic_year_id: string;
  start_date: string;
  end_date: string;
  description?: string;
  status: "Active" | "Inactive";
}

export interface UpdateQuarterData {
  name?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  status?: "Active" | "Inactive";
}



// API Functions
export const getAllQuarters = (
  params?: QuarterFilterParams
): Promise<AxiosResponse<PaginatedQuarters>> => {
  return api.get("/quarter/get_all_quarters", { params });
};

export const getQuarterById = (
  quarterId: number
): Promise<AxiosResponse<SingleQuarterResponse>> => {
  return api.get(`/quarter/get_quarter_by_id/${quarterId}`);
};

export const createQuarter = (
  payload: CreateQuarterData
): Promise<AxiosResponse<SingleQuarterResponse>> => {
  return api.post("/quarter/create_quarter", payload);
};

export const updateQuarter = (
  quarterId: number,
  payload: UpdateQuarterData
): Promise<AxiosResponse<SingleQuarterResponse>> => {
  return api.put(`/quarter/update_quarter/${quarterId}`, payload);
};

export const deleteQuarter = (
  quarterId: number
): Promise<AxiosResponse<DeleteQuarterResponse>> => {
  return api.put(`/quarter/delete_quarter/${quarterId}`);
};

// Legacy exports for backward compatibility
export type CreateQuarterFormData = CreateQuarterData;
export type CreateQuarterResponse = SingleQuarterResponse;
