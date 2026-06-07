import type { Branch } from "@/types/__restaurant";
import type { AxiosResponse } from "axios";
import api from ".";

export const getBranches = (): Promise<AxiosResponse<{ data: Branch[] }>> =>
  api.get("/branch");

export const createBranch = (
  data: Partial<Branch>
): Promise<AxiosResponse<{ message: string; data: Branch }>> =>
  api.post("/branch", data);

export const updateBranch = (
  id: string,
  data: Partial<Branch>
): Promise<AxiosResponse<{ message: string; data: Branch }>> =>
  api.put(`/branch/${id}`, data);
