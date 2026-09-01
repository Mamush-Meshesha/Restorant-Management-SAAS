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

export const getAvailableTablesApi = async (params: { reservation_time: string, guest_count: number, branch_id: string, area_id?: string }) => {
  const { data } = await api.get("/reservation/available-tables", { params });
  return data?.data ?? [];
};

export const getTimeSlotsApi = async (params: { date: string, guest_count: number, branch_id: string }) => {
  const { data } = await api.get("/reservation/time-slots", { params });
  return data?.data ?? [];
};
