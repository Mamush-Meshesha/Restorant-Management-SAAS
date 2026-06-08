import api from "./client";

export interface CreateReservationPayload {
  table_id: string;
  customer_name: string;
  customer_phone: string;
  reservation_time: string; // ISO string
  guest_count: number;
  special_requests?: string;
}

export const createReservationApi = async (payload: CreateReservationPayload) => {
  const { data } = await api.post("/reservation", payload);
  return data;
};

export const getReservationsApi = async () => {
  const { data } = await api.get("/reservation");
  return data?.data ?? [];
};

export const updateReservationStatusApi = async (id: string, status: string) => {
  const { data } = await api.put(`/reservation/${id}/status`, { status });
  return data;
};

export const getTablesApi = async () => {
  const { data } = await api.get("/table");
  return data?.data ?? [];
};
