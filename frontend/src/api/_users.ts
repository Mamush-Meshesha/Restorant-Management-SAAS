import type { User } from "@/types/__auth";
import type { AxiosResponse } from "axios";
import api from ".";

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: string;
  branch_id?: string;
}

export const getUsers = (params?: {
  branch_id?: string;
  role_id?: string;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<{ data: User[] }>> => api.get("/user", { params });

export const createUser = (
  data: CreateUserInput
): Promise<AxiosResponse<{ message: string; data: { id: string; username: string } }>> =>
  api.post("/user", data);

export const updateUser = (
  id: string,
  data: Partial<CreateUserInput>
): Promise<AxiosResponse<{ message: string; data: User }>> =>
  api.put(`/user/${id}`, data);

export const deleteUser = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/user/${id}`);
