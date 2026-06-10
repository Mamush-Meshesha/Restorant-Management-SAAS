import type { AxiosResponse } from "axios";
import api from ".";

export interface TableSession {
  session_id: string;
  session_token: string;
  table_id: string;
}

export const joinTableSession = (
  token: string
): Promise<AxiosResponse<{ message: string; data: TableSession }>> =>
  api.post(`/session/join/${token}`);

export const syncCart = (
  session_token: string,
  cartItems: any[]
): Promise<AxiosResponse<{ message: string }>> =>
  api.post(`/session/cart/${session_token}/sync`, { cartItems });
