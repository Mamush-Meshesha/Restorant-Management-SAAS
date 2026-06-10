import type { AxiosResponse } from "axios";
import api from ".";

export interface WaitlistItem {
  id: string;
  branch_id: string;
  customer_name: string;
  customer_phone: string;
  guest_count: number;
  quoted_time: number;
  status: "WAITING" | "NOTIFIED" | "SEATED" | "LEFT";
  created_at: string;
}

export const joinWaitlist = (data: {
  branch_id: string;
  customer_name: string;
  customer_phone: string;
  guest_count: number;
}): Promise<AxiosResponse<{ message: string; data: WaitlistItem; position: number }>> =>
  api.post("/waitlist/join", data);

export const getWaitlistStatus = (
  id: string
): Promise<AxiosResponse<{ data: WaitlistItem; position: number | null }>> =>
  api.get(`/waitlist/${id}/status`);

export const getBranchWaitlist = (
  branchId: string
): Promise<AxiosResponse<{ data: WaitlistItem[] }>> =>
  api.get(`/waitlist/branch/${branchId}`);

export const updateWaitlistStatus = (
  id: string,
  status: "WAITING" | "NOTIFIED" | "SEATED" | "LEFT"
): Promise<AxiosResponse<{ message: string; data: WaitlistItem }>> =>
  api.put(`/waitlist/${id}/status`, { status });
