// api/institute.ts

import type { Institute } from "@/types/__institute";
import { type AxiosResponse } from "axios";
import api from ".";

export interface CreateInstituteResponse {
  message: string;
  institute: Institute;
}

export interface GetAllInstitutesResponse {
  message: string;
  institutes: Institute[];
}

export interface GetSingleInstituteResponse {
  message: string;
  institute: Institute;
}

// PUT: Update Institute
export const updateInstitute = (
  instituteId: string,
  payload: FormData
): Promise<AxiosResponse<CreateInstituteResponse>> =>
  api.put(`/institute/update_institute/${instituteId}`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// DELETE: Delete Institute
export const deleteInstitute = (
  instituteId: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/institute/delete/${instituteId}`);

// GET: Get all institutes
export const getAllInstitutes = (): Promise<
  AxiosResponse<GetAllInstitutesResponse>
> => api.get("/institute/all");

// GET: Get single institute by ID
export const getInstituteById = (
  instituteId: string
): Promise<AxiosResponse<GetSingleInstituteResponse>> =>
  api.get(`/institute/get_institute/${instituteId}`);

// GET: Get current user's institute (from auth context)
export const getCurrentUserInstitute = (
  instituteId: string
): Promise<AxiosResponse<GetSingleInstituteResponse>> =>
  api.get(`/auth/institutes/${instituteId}`);
