import type { Recipe } from "../types/__restaurant";
import type { AxiosResponse } from "axios";
import api from ".";

export const getRecipes = (menuItemId?: string): Promise<AxiosResponse<{ data: Recipe[] }>> => {
  return api.get("/recipe", { params: { menuItemId } });
};

export const createRecipe = (data: Partial<Recipe>): Promise<AxiosResponse<{ data: Recipe }>> => {
  return api.post("/recipe", data);
};

export const updateRecipe = (id: string, data: Partial<Recipe>): Promise<AxiosResponse<{ data: Recipe }>> => {
  return api.put(`/recipe/${id}`, data);
};

export const deleteRecipe = (id: string): Promise<AxiosResponse> => {
  return api.delete(`/recipe/${id}`);
};
