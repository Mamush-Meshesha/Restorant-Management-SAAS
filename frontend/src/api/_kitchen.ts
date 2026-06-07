import type { KitchenOrder } from "@/types/__restaurant";
import type { AxiosResponse } from "axios";
import api from ".";

export const getKitchenOrders = (params?: {
  status?: string;
  station_id?: string;
}): Promise<AxiosResponse<{ data: KitchenOrder[] }>> =>
  api.get("/kitchen/orders", { params });

export const updateKitchenOrderStatus = (
  id: string,
  status: string
): Promise<AxiosResponse<{ message: string; data: KitchenOrder }>> =>
  api.put(`/kitchen/orders/${id}/status`, { status });
