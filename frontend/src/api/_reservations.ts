import type { AxiosResponse } from "axios";
import api from ".";

export const getReservations = (params?: { date?: string }): Promise<AxiosResponse<{ data: any[] }>> =>
  api.get("/reservation", { params });

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

export const updateReservation = (
  id: string,
  data: any
): Promise<AxiosResponse<{ message: string; data: any }>> =>
  api.put(`/reservation/${id}`, data);

export const deleteReservation = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/reservation/${id}`);
