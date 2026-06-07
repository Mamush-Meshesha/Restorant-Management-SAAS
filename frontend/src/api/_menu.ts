import type { MenuCategory, MenuItem } from "@/types/__restaurant";
import type { AxiosResponse } from "axios";
import api from ".";

// ── Categories ────────────────────────────────────────────────────────────────

export const getCategories = (): Promise<AxiosResponse<{ data: MenuCategory[] }>> =>
  api.get("/menu/categories");

export const createCategory = (
  data: Partial<MenuCategory>
): Promise<AxiosResponse<{ message: string; data: MenuCategory }>> =>
  api.post("/menu/categories", data);

export const updateCategory = (
  id: string,
  data: Partial<MenuCategory>
): Promise<AxiosResponse<{ message: string; data: MenuCategory }>> =>
  api.put(`/menu/categories/${id}`, data);

export const deleteCategory = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/menu/categories/${id}`);

// ── Menu Items ────────────────────────────────────────────────────────────────

export const getMenuItems = (
  categoryId?: string
): Promise<AxiosResponse<{ data: MenuItem[] }>> =>
  api.get("/menu/items", { params: categoryId ? { categoryId } : {} });

export const createMenuItem = (
  data: Partial<MenuItem>
): Promise<AxiosResponse<{ message: string; data: MenuItem }>> =>
  api.post("/menu/items", data);

export const updateMenuItem = (
  id: string,
  data: Partial<MenuItem>
): Promise<AxiosResponse<{ message: string; data: MenuItem }>> =>
  api.put(`/menu/items/${id}`, data);

export const deleteMenuItem = (
  id: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/menu/items/${id}`);
