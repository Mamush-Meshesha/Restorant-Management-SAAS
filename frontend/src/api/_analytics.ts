import type { AxiosResponse } from "axios";
import api from ".";

export const getRevenueSummary = (): Promise<AxiosResponse<{ data: any }>> =>
  api.get("/analytics/revenue/summary");

export const getLiveDashboard = (branchId?: string): Promise<AxiosResponse<{ data: any }>> =>
  api.get("/analytics/dashboard", { params: { branchId } });

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
  amount: number;
  category_id: string;
  date: string;
  reference?: string;
  notes?: string;
}): Promise<AxiosResponse<{ message: string; data: any }>> =>
  api.post("/analytics/expenses", data);

export const getExpenseCategories = (): Promise<AxiosResponse<{ data: any[] }>> =>
  api.get("/analytics/expense-categories");

export const createExpenseCategory = (data: { name: string }): Promise<AxiosResponse<{ message: string; data: any }>> =>
  api.post("/analytics/expense-categories", data);

