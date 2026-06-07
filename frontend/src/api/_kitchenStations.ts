import type { AxiosResponse } from "axios";
import api from ".";

export const getKitchenStations = (): Promise<AxiosResponse<{ data: any[] }>> =>
  api.get("/kitchen/stations");

export const createKitchenStation = (data: {
  branch_id: string;
  name: string;
}): Promise<AxiosResponse<{ message: string; data: any }>> =>
  api.post("/kitchen/stations", data);

export const updateKitchenStation = (
  id: string,
  data: { name?: string; is_active?: boolean }
): Promise<AxiosResponse<{ message: string; data: any }>> =>
  api.put(`/kitchen/stations/${id}`, data);

export const deleteKitchenStation = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/kitchen/stations/${id}`);
