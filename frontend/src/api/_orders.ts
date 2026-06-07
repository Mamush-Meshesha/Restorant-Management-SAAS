import type { Order } from "@/types/__restaurant";
import type { AxiosResponse } from "axios";
import api from ".";

// ── Orders ────────────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  table_id?: string;
  order_type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  items: { menu_item_id: string; quantity: number; notes?: string }[];
  notes?: string;
}

export const getOrders = (params?: {
  status?: string;
  branch_id?: string;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<{ data: Order[]; total?: number }>> =>
  api.get("/order", { params });

export const getOrderById = (
  id: string
): Promise<AxiosResponse<{ data: Order }>> => api.get(`/order/${id}`);

export const createOrder = (
  data: CreateOrderInput
): Promise<AxiosResponse<{ message: string; data: Order }>> =>
  api.post("/order", data);

export const updateOrderStatus = (
  id: string,
  status: string
): Promise<AxiosResponse<{ message: string; data: Order }>> =>
  api.put(`/order/${id}/status`, { status });

export const cancelOrder = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.put(`/order/${id}/cancel`);
