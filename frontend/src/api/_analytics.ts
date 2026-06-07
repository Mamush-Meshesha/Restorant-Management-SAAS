import type { AxiosResponse } from "axios";
import api from ".";

export const getRevenueSummary = (): Promise<AxiosResponse<{ data: any }>> =>
  api.get("/analytics/revenue/summary");

export const getDailyRevenue = (params?: {
  from?: string;
  to?: string;
}): Promise<AxiosResponse<{ data: any[] }>> =>
  api.get("/analytics/revenue/daily", { params });

export const getRevenueReport = (params?: {
  from?: string;
  to?: string;
}): Promise<AxiosResponse<{ data: any[] }>> =>
  api.get("/analytics/revenue/daily", { params });

export const getExpenses = (): Promise<AxiosResponse<{ data: any[] }>> =>
  api.get("/analytics/expenses");

export const createExpense = (data: {
  name: string;
  amount: number;
  category?: string;
  notes?: string;
}): Promise<AxiosResponse<{ message: string; data: any }>> =>
  api.post("/analytics/expenses", data);
