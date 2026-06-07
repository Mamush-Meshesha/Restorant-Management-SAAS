import type { AxiosResponse } from "axios";
import api from ".";

export const getReservations = (): Promise<AxiosResponse<{ data: any[] }>> =>
  api.get("/reservation");

export const createReservation = (data: {
  table_id: string;
  customer_name: string;
  customer_phone?: string;
  reservation_time: string;
  guest_count: number;
  special_requests?: string;
}): Promise<AxiosResponse<{ message: string; data: any }>> =>
  api.post("/reservation", data);

export const updateReservationStatus = (
  id: string,
  status: string
): Promise<AxiosResponse<{ message: string; data: any }>> =>
  api.put(`/reservation/${id}/status`, { status });
