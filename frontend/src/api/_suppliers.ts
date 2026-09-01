import type { Supplier, PurchaseOrder } from "@/types/__restaurant";
import type { AxiosResponse } from "axios";
import api from ".";

export const getSuppliers = (): Promise<AxiosResponse<{ data: Supplier[] }>> =>
  api.get("/supplier");

export const createSupplier = (
  data: Partial<Supplier>
): Promise<AxiosResponse<{ message: string; data: Supplier }>> =>
  api.post("/supplier", data);

export const updateSupplier = (
  id: string,
  data: Partial<Supplier>
): Promise<AxiosResponse<{ message: string; data: Supplier }>> =>
  api.put(`/supplier/${id}`, data);

export const deleteSupplier = (id: string): Promise<AxiosResponse> =>
  api.delete(`/supplier/${id}`);

export const getPurchaseOrders = (): Promise<AxiosResponse<{ data: PurchaseOrder[] }>> =>
  api.get("/supplier/po");

export const createPurchaseOrder = (data: {
  supplier_id: string;
  expected_date?: string;
  items: { inventory_item_id: string; quantity: number; unit_price: number }[];
}): Promise<AxiosResponse<{ message: string; data: PurchaseOrder }>> =>
  api.post("/supplier/po", data);
