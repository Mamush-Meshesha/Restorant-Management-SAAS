import type { KitchenOrder, KitchenStation } from "@/types/__restaurant";
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

export const getKitchenStations = (
  branchId?: string
): Promise<AxiosResponse<{ data: KitchenStation[] }>> =>
  api.get("/kitchen/stations", { params: { branchId } });

export const createKitchenStation = (
  data: Partial<KitchenStation>
): Promise<AxiosResponse<{ message: string; data: KitchenStation }>> =>
  api.post("/kitchen/stations", data);

export const updateKitchenStation = (
  id: string,
  data: Partial<KitchenStation>
): Promise<AxiosResponse<{ message: string; data: KitchenStation }>> =>
  api.put(`/kitchen/stations/${id}`, data);

export const deleteKitchenStation = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/kitchen/stations/${id}`);
