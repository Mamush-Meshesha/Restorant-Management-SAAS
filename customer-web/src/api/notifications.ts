import api from "./client";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const getNotificationsApi = async (): Promise<Notification[]> => {
  const { data } = await api.get("/notification");
  return data?.data ?? [];
};

export const markNotificationReadApi = async (id: string) => {
  const { data } = await api.put(`/notification/${id}/read`);
  return data;
};
