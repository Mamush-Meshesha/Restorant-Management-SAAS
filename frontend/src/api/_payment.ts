import type { AxiosResponse } from "axios";
import api from ".";
import type {  PaymentsPaginatedResponse } from "@/types/__payments";



export const getPayments = (
  params?: { page?: number; limit?: number; search?: string; status?: string; grade?: string; section?: string },
  signal?: AbortSignal
): Promise<AxiosResponse<PaymentsPaginatedResponse>> => {
  return api.get("/payment/get_all_payments", { params, signal });
};

export const createPayment = (payload: unknown) => api.post("/payment/create_payment", payload);

export const updatePayment = (paymentId: string, payload: unknown) => api.put(`/payment/update_payment/${paymentId}`, payload);

export const deletePayment = (paymentId: string) => api.delete(`/payment/delete_payment/${paymentId}`);

export const getPaymentById = (paymentId: string) => api.get(`/payment/get_payment/${paymentId}`);

export const getPaymentsByStudent = (studentId: string) => api.get(`/payment/get_payments_by_student/${studentId}`);

export const getPaymentByReceipt = (receiptId: string) => api.get(`/payment/receipt/${receiptId}`);

export const getUnpaidByFrequency = (params?: unknown, signal?: AbortSignal) => api.get("/payment/unpaid_by_frequency", { params, signal });

export default {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentById,
  getPaymentsByStudent,
  getPaymentByReceipt,
  getUnpaidByFrequency,
};
