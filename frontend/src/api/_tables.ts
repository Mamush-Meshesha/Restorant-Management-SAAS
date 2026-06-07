import type { DiningArea, Table } from "@/types/__restaurant";
import type { AxiosResponse } from "axios";
import api from ".";

// ── Dining Areas ──────────────────────────────────────────────────────────────

export const getDiningAreas = (
  branchId: string
): Promise<AxiosResponse<{ data: DiningArea[] }>> =>
  api.get("/table/areas", { params: { branchId } });

export const createDiningArea = (
  data: Partial<DiningArea>
): Promise<AxiosResponse<{ message: string; data: DiningArea }>> =>
  api.post("/table/areas", data);

export const updateDiningArea = (
  id: string,
  data: Partial<DiningArea>
): Promise<AxiosResponse<{ message: string; data: DiningArea }>> =>
  api.put(`/table/areas/${id}`, data);

export const deleteDiningArea = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/table/areas/${id}`);

// ── Tables ────────────────────────────────────────────────────────────────────

export const getTables = (params?: {
  branchId?: string;
  areaId?: string;
  status?: string;
}): Promise<AxiosResponse<{ data: Table[] }>> =>
  api.get("/table", { params });

export const createTable = (
  data: Partial<Table>
): Promise<AxiosResponse<{ message: string; data: Table }>> =>
  api.post("/table", data);

export const updateTableStatus = (
  id: string,
  status: string
): Promise<AxiosResponse<{ message: string; data: Table }>> =>
  api.put(`/table/${id}/status`, { status });

export const updateTable = (
  id: string,
  data: Partial<Table>
): Promise<AxiosResponse<{ message: string; data: Table }>> =>
  api.put(`/table/${id}`, data);

export const deleteTable = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/table/${id}`);
