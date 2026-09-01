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
  data: { item_id: string; quantity: number; type: 'ADD' | 'DEDUCT'; reason: string }
): Promise<AxiosResponse<{ message: string }>> => {
  const quantity_changed = data.type === 'ADD' ? data.quantity : -data.quantity;
  return api.post("/inventory/adjust", { item_id: data.item_id, quantity_changed, reason: data.reason });
};

export const logWaste = (
  data: { item_id: string; item_name: string; quantity: number; cost_loss: number; reason: string }
): Promise<AxiosResponse<{ message: string }>> =>
  api.post("/inventory/waste", data);
