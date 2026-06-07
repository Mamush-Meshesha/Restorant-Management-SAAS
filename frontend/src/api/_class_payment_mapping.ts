import { type AxiosResponse } from "axios";
import api from ".";
import type { ClassPaymentMapping } from "@/types/__class_payment_mapping";

// POST: Create Class Payment Mapping
export const createClassPaymentMapping = (
  payload: Partial<ClassPaymentMapping>
): Promise<AxiosResponse<{ message: string; data: ClassPaymentMapping }>> =>
  api.post("classPaymentMapping/create_class_payment_mapping", payload);

// PUT: Update Class Payment Mapping
export const updateClassPaymentMapping = (
  classPaymentMappingId: string ,
  payload: Partial<ClassPaymentMapping>
): Promise<AxiosResponse<{ message: string; data: ClassPaymentMapping }>> =>
  api.put(`/classPaymentMapping/update_class_payment_mapping/${classPaymentMappingId}`, payload);

// DELETE: Delete Class Payment Mapping
export const deleteClassPaymentMapping = (
  classPaymentMappingId: string
): Promise<AxiosResponse<{ message: string }>> => api.delete(`/classPaymentMapping/delete_class_payment_mapping/${classPaymentMappingId}`);

// GET: All Class Payment Mappings
export const getAllClassPaymentMappings = (
  params?: { page?: number; limit?: number; name?: string },
  signal?: AbortSignal
): Promise<
  AxiosResponse<{
    message?: string;
    data: ClassPaymentMapping[];
    pagination?: { page: number; limit: number; total: number; totalPages: number };
  }>
> => api.get("/classPaymentMapping/get_all_class_payment_mappings", { params, signal });

// GET: Single Class Payment Mapping by ID
export const getClassPaymentMappingById = (
  id: string
): Promise<AxiosResponse<{ data: ClassPaymentMapping }>> => api.get(`/classPaymentMapping/${id}`);
