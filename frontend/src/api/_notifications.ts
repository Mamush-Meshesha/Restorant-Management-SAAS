import type { AxiosResponse } from "axios";
import api from ".";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = (): Promise<AxiosResponse<{ data: Notification[] }>> =>
  api.get("/notification");

export const markNotificationRead = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.put(`/notification/${id}/read`);
