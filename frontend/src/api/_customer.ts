import type { AxiosResponse } from "axios";
import api from ".";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  organization_id: string;
  created_at: string;
}

export const getCustomers = (): Promise<AxiosResponse<{ data: Customer[] }>> =>
  api.get("/customer");

export const createCustomer = (data: {
  name: string;
  email?: string;
  phone?: string;
}): Promise<AxiosResponse<{ message: string; data: Customer }>> =>
  api.post("/customer", data);
