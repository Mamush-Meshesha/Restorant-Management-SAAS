import type { InventoryItem } from "@/types/__restaurant";
import type { AxiosResponse } from "axios";
import api from ".";

export const getInventory = (params?: {
  branch_id?: string;
}): Promise<AxiosResponse<{ data: InventoryItem[] }>> =>
  api.get("/inventory", { params });

export const addInventoryItem = (
  data: Partial<InventoryItem>
): Promise<AxiosResponse<{ message: string; data: InventoryItem }>> =>
  api.post("/inventory", data);

export const adjustStock = (
  data: { item_id: string; quantity: number; type: 'ADD' | 'DEDUCT'; reason?: string }
): Promise<AxiosResponse<{ message: string }>> =>
  api.post("/inventory/adjust", data);

export const logWaste = (
  data: { item_id: string; quantity: number; reason?: string }
): Promise<AxiosResponse<{ message: string }>> =>
  api.post("/inventory/waste", data);
