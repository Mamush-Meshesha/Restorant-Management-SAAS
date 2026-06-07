// api/payment.ts

import { type AxiosResponse } from "axios";
import api from ".";
import type { CreatePaymentFrequencyResponse, GetAllPaymentFrequenciesResponse, GetSinglePaymentFrequencyResponse, PaymentFrequency, PaymentFrequencyFormData, PaymentFrequencySearchParams } from "@/types/__payments";


// POST: Create Payment
export const createPaymentFrequency = (
  payload: PaymentFrequencyFormData
): Promise<AxiosResponse<CreatePaymentFrequencyResponse>> =>
  api.post("/paymentFrequency/create_payment_frequency", payload);

// PUT: Update Payment
export const updatePaymentFrequency = (
  paymentFrequencyId: string,
  payload:  PaymentFrequencyFormData
): Promise<AxiosResponse<{ message: string; paymentFrequency: PaymentFrequency }>> =>
  api.put(`/paymentFrequency/update_payment_frequency/${paymentFrequencyId}`, payload);


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
// DELETE: Delete Payment
export const deletePaymentFrequency = (
  paymentFrequencyId: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/paymentFrequency/delete_payment_frequency/${paymentFrequencyId}`);

// GET: All Payment Frequencies
export const getAllPaymentFrequencies = (
  params?: PaymentFrequencySearchParams,
  signal?: AbortSignal
): Promise<AxiosResponse<GetAllPaymentFrequenciesResponse>> => api.get("/paymentFrequency/get_all_payment_frequencies", { params, signal });

// GET: Single Payment by ID
export const getPaymentFrequencyById = (
  paymentFrequencyId: string
): Promise<AxiosResponse<GetSinglePaymentFrequencyResponse>> =>
  api.get(`/paymentFrequency/get_payment_frequency/${paymentFrequencyId}`);