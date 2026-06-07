// api/payment.ts

import { type AxiosResponse } from "axios";
import api from ".";
import type { CreatePaymentTypeResponse, GetAllPaymentTypesResponse, GetSinglePaymentTypeResponse, PaymentTypeFormData, PaymentTypeSearchParams } from "@/types/__payments";


// POST: Create Payment
export const createPaymentType = (
  payload: PaymentTypeFormData
): Promise<AxiosResponse<CreatePaymentTypeResponse>> =>
  api.post("/paymentType/create_payment_type", payload);


// PUT: Update Payment
export const updatePaymentType = (
  paymentId: string,
  payload: PaymentTypeFormData
): Promise<AxiosResponse<CreatePaymentTypeResponse>> =>
  api.put(`/paymentType/update_payment_type/${paymentId}`, payload);

// DELETE: Delete Payment
export const deletePaymentType = (
  paymentId: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/paymentType/delete_payment_type/${paymentId}`);

// GET: All Payments
export const getAllPaymentTypes = (
  params?: PaymentTypeSearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<GetAllPaymentTypesResponse>> =>
  api.get("/paymentType/get_all_payment_types", { params, signal });

// GET: Single Payment by ID
export const getPaymentTypeById = (
  paymentId: string
): Promise<AxiosResponse<GetSinglePaymentTypeResponse>> =>
  api.get(`/paymentType/get_payment_type/${paymentId}`);
